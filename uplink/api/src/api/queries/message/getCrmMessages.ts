import * as moment from 'moment';

import { Context } from '../../../context';
import { Conversation, Message } from '../../../models';
import { ResourceNotFound } from '../../exceptions/ResourceNotFound';
import { UplinkGraphQLException } from '../../exceptions/UplinkGraphQLException';
import {
  CrmGetMessagesResponse,
  MessageType,
  OrganizationSalesforceIntegrationMetadata,
  CRM_INTEGRATION_MESSAGE_QUERY_LIMIT
} from '../../../@types';

const ISO_NO_TZ_REGEX = '\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z';
const UUID4_REGEX = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const MESSAGE_ID_REGEX = new RegExp(`^before:${ISO_NO_TZ_REGEX}|${UUID4_REGEX}$`);

// We need to ensure there is enough room for the rest of the HTTP request after
// adding the body.
//
// 8kb is the default limit for Apache.
const RESPONSE_SIZE_MARGIN_KB = 8;

const responseIsTooLarge = (response: CrmGetMessagesResponse, maxResponseSizeKb: number) => Buffer.byteLength(JSON.stringify(response), 'utf8') + (RESPONSE_SIZE_MARGIN_KB * 1000) > maxResponseSizeKb * 1000;

export default async (
  _,
  args: {
    last_received_msg_id: string;
    max_response_size_kb: number;
  },
  ctx: Context
) => {
  console.info('Validating...');
  // We get the time at the start because async actions will cause delays.
  const requestReceived = moment.utc();

  if (!MESSAGE_ID_REGEX.test(args.last_received_msg_id)) {
    throw new UplinkGraphQLException('last_received_msg_id must be a v4 UUID or a before: ISO string');
  }

  if (!Number.isInteger(args.max_response_size_kb) || args.max_response_size_kb < 1) {
    throw new UplinkGraphQLException('max_response_size_kb must be an integer greater than 0.');
  }
  const org = await ctx.Services.OrganizationService.read(ctx.Context.state.organization);

  if (org === null || typeof org !== 'object') {
    throw new ResourceNotFound(`Either organization ${org.id} does not exist or you do not have access to it.`);
  }

  let selectedIntegration = 'uplinkSalesforceIntegration';
  console.info(`Received authorization header: ${ctx.Context.header.authorization}`)
  let accessToken: string = ctx.Context.headers.authorization;
  
  if (accessToken.startsWith('Basic ')) {
    const encoded = accessToken.split(' ')[1];
    const [orgSlug, integrationToken] = Buffer.from(encoded, 'base64').toString('utf8').split(':')
    console.info(`Decoded Basic Auth value: ${orgSlug}:${integrationToken}`);

    // TODO: Refactor the 3rd party integration logic to make this generic
    // instead of dependent on several specific property names; lame
    const isValidIntegrationToken = Object.entries(org.integrationTokens).some(entry => {
      const [ integrationName, integration ] = entry;
      if (integration.value === integrationToken) {
        switch (integrationName) {
          case 'genericCRM':
            selectedIntegration = 'genericCRMIntegration';
            break;
          case 'smartAdvocate':
            selectedIntegration = 'smartAdvocateIntegration';
            break;
          case 'salesforce':
          default:
            selectedIntegration = 'uplinkSalesforceIntegration';
        }
        return true;
      }
      return false;
    });

    if (! isValidIntegrationToken) {
      throw new ResourceNotFound('The basic authentication value does not contain a valid integration token.');
    }
  }

  if (! org[selectedIntegration]) {
    throw new ResourceNotFound(`The organization ${org.id} does not contain valid integration configuration metadata.`);
  }

  console.info(`Using integration \"${selectedIntegration}\" metadata`);

  const {
    flags,
    metadata: oldMetadata,
    pollingInterval,
  } = org[selectedIntegration];
  const response: CrmGetMessagesResponse = {
    settings: {
      associate_new_records: flags.associateOnContactOrLeadCreation,
      create_call_tasks: flags.syncCalls,
      create_text_tasks: flags.syncMessages,
    },
  };
  const newMetadata: Partial<OrganizationSalesforceIntegrationMetadata> = {
    // The purpose of the limit is to ensure that the context of the previously
    // batched query remains in the metadata, even if the MESSAGE_QUERY_LIMIT
    // changes in the future. This way, ongoing batches will not lose their
    // place.
    currentBatchLimit: CRM_INTEGRATION_MESSAGE_QUERY_LIMIT,
    // The batch offset is added directly to the SQL query. Its purpose is to
    // ensure that for ongoing batches, the previous query is replicable, and
    // also to ensure that the do/while below eventually ends due to either:
    //
    // 1. Running out of records in the queried timeframe.
    // 2. Finding valid (non-filtered) records within the queried timeframe.
    currentBatchOffset: 0,
    // The filtered offset is a relative start position applied against the
    // number of records that are to be returned to the CRM. It helps us to keep
    // our place in the set of results for the current limit and offset. There
    // are two conditions which can cause calls and texts to be filtered out:
    //
    // 1. The format of the call or text is invalid.
    // 2. The response body is too large to be returned, and must be truncated.
    currentFilterOffset: 0,
  };

  // If the integration is disabled, we'll just return the empty message array
  // along with the settings.
  if (flags.syncRecords) {
    console.info('Validation complete. Determining retrieval mode...');
    newMetadata.lastSuccessfulSync = requestReceived.valueOf();

    const isTimestampBatch = args.last_received_msg_id.startsWith('before:');
    const isStartOfBatch = args.last_received_msg_id !== oldMetadata.currentBatchLowerBoundMessageId;
    let currentBatchLowerBoundMoment: moment.Moment;
    let currentBatchUpperBoundMoment: moment.Moment;

    if (!isStartOfBatch) {
      // If this request is a continuation of a previous batch, we should
      // inherit the paging context of the last request.
      newMetadata.currentBatchLimit = oldMetadata.currentBatchLimit;
      newMetadata.currentBatchOffset = oldMetadata.currentBatchOffset;
      newMetadata.currentFilterOffset = oldMetadata.currentFilterOffset;
    }
    newMetadata.currentBatchLowerBoundMessageId = args.last_received_msg_id;

    if (isTimestampBatch) {
      console.info('Preparing to retrieve records in "timestamp" mode:');
      currentBatchUpperBoundMoment = moment.utc(args.last_received_msg_id.split(':').slice(1).join(':'));
      console.info(`- Using configured period of ${pollingInterval.increment} ${pollingInterval.unit}`);
      console.info(`- Using provided upper boundary of ${currentBatchUpperBoundMoment.toISOString()}`);
      currentBatchLowerBoundMoment = currentBatchUpperBoundMoment.clone()
        .subtract(pollingInterval.increment, pollingInterval.unit);
      console.info(`- Using standard lower boundary of ${currentBatchLowerBoundMoment.toISOString()}`);
      newMetadata.currentBatchUpperBoundTimestamp = currentBatchUpperBoundMoment.valueOf();
    } else {
      console.info('Preparing to retrieve records in "message ID" mode:');

      if (isStartOfBatch || !Number.isInteger(oldMetadata.currentBatchUpperBoundTimestamp)) {
        if (!isStartOfBatch) {
          console.error('An ID batch was continued without an upper bound. Defaulting to message receipt...');
        }
        currentBatchUpperBoundMoment = requestReceived.clone();
        console.info(`- Using default upper boundary of request timestamp ${currentBatchUpperBoundMoment.toISOString()}`);
      } else {
        currentBatchUpperBoundMoment = moment.utc(oldMetadata.currentBatchUpperBoundTimestamp);
        console.info(`- Using saved upper boundary of ${currentBatchUpperBoundMoment.toISOString()}`);
      }
      console.info(`- Looking up lower bound message ${args.last_received_msg_id}...`);

      const currentBatchLowerBoundMessage = await Message.query(ctx.db).findOne({
        organization_id: org.id,
        public_id: args.last_received_msg_id,
      });

      if (!(currentBatchLowerBoundMessage instanceof Message)) {
        throw new ResourceNotFound(`Either message ${args.last_received_msg_id} does not exist or you do not have access to it.`);
      }
      console.info('- Lower bound message found');

      if (currentBatchLowerBoundMessage.public_status === 'DROPPED') {
        currentBatchLowerBoundMoment = moment.utc(currentBatchLowerBoundMessage.updated_at).add(4, 'hours');
      } else {
        currentBatchLowerBoundMoment = moment.utc(currentBatchLowerBoundMessage.updated_at);
      }
      console.info(`- Using standard lower boundary of ${currentBatchLowerBoundMoment.toISOString()}`);
      newMetadata.currentBatchUpperBoundTimestamp = null;
    }
    const currentBatchDroppedCallLowerBoundMoment = currentBatchLowerBoundMoment.clone().subtract(4, 'hours');
    const currentBatchDroppedCallUpperBoundMoment = currentBatchUpperBoundMoment.clone().subtract(4, 'hours');

    console.info(`- Using dropped call upper boundary of ${currentBatchDroppedCallUpperBoundMoment.toISOString()}`);
    console.info(`- Using dropped call lower boundary of ${currentBatchDroppedCallLowerBoundMoment.toISOString()}`);

    let rawMessages: Message[];
    let filteredMessages: Message[];
    let retrievalAttempts = 1;

    // The do/while loop addresses an edge case in which every record may be
    // filtered out, which would cause an empty results set and a false
    // final_page, triggering an infinite batched re-request. To get around
    // this, the result set is queried again in that case until it is either
    // empty or contains valid messages, which are both valid states.
    do {
      console.info(`Preparations complete. Attempt #${retrievalAttempts++} (limit ${newMetadata.currentBatchLimit} offset ${newMetadata.currentBatchOffset}) to retrieve records...`);

      rawMessages = await Message.query(ctx.db)
        .whereNotNull('recipient_snapshot') // Excludes messages prior to recipient tracking
        .whereNotNull('sender_snapshot') // Excludes messages prior to sender tracking
        .andWhere('organization_id', org.id)
        .andWhere((qb) => {
          qb.where((qb2) => { // TEXTS (excluding system texts)
            qb2.where('type', MessageType.USER)
              .andWhere('message', 'not like', 'SYSTEM MSG:%')
              .andWhere('updated_at', '>', currentBatchLowerBoundMoment.toISOString())
              .andWhere('updated_at', '<=', currentBatchUpperBoundMoment.toISOString());
            })
            .orWhere((qb2) => {
              qb2.where('type', MessageType.CALL)
                .andWhere((qb3) => {
                  qb3.where((qb4) => { // COMPLETED CALLS
                      qb4.where('call_completed_at', '>', currentBatchLowerBoundMoment.toISOString())
                        .andWhere('call_completed_at', '<=', currentBatchUpperBoundMoment.toISOString());
                      })
                    .orWhere((qb4) => { // DROPPED CALLS
                      qb4.where('call_status', 'INCOMPLETE')
                        .andWhere('updated_at', '>', currentBatchDroppedCallLowerBoundMoment.toISOString())
                        .andWhere('updated_at', '<=', currentBatchDroppedCallUpperBoundMoment.toISOString());
                    });
                });
            });
        })
        .orderBy('updated_at')
        .limit(newMetadata.currentBatchLimit)
        .offset(newMetadata.currentBatchOffset)
        .eager('conversation');

      console.info(`Found ${rawMessages.length} records. Filtering out invalid records...`);

      filteredMessages = rawMessages.filter((message) => {
        let allowed = true;

        if (typeof message.recipient.physicalNumber !== 'string') {
          console.error(`Message ${message.public_id} failed because recipient.physicalNumber is not a string.`);
          allowed = false;
        }

        if (message.recipient.phoneNumber === null || typeof message.recipient.phoneNumber !== 'object') {
          console.error(`Message ${message.public_id} failed because recipient.phoneNumber is not an object.`);
          allowed = false;
        } else if (typeof message.recipient.phoneNumber.systemNumber !== 'string') {
          console.error(`Message ${message.public_id} failed because recipient.phoneNumber.systemNumber is not a string.`);
          allowed = false;
        }

        if (typeof message.sender.physicalNumber !== 'string') {
          console.error(`Message ${message.public_id} failed because sender.physicalNumber is not a string.`);
          allowed = false;
        }

        if (message.sender.phoneNumber === null || typeof message.sender.phoneNumber !== 'object') {
          console.error(`Message ${message.public_id} failed because sender.phoneNumber is not an object.`);
          allowed = false;
        } else if (typeof message.sender.phoneNumber.systemNumber !== 'string') {
          console.error(`Message ${message.public_id} failed because sender.phoneNumber.systemNumber is not a string.`);
          allowed = false;
        }
        return allowed;
      })
      // If this query is identical to the last one we should offset our
      // results against the filtered offset of the previous request.
      .slice(newMetadata.currentFilterOffset);

      if (
        rawMessages.length === newMetadata.currentBatchLimit &&
        filteredMessages.length === 0
      ) {
        console.info(`Filtered records. ${filteredMessages.length} remaining. Retrying query with an increased offset...`);
        // If every record was filtered out, we should retry the query with an
        // increased offset. Because the set of results should be entirely new,
        // our previous filter offset should be wiped out.
        newMetadata.currentBatchOffset += newMetadata.currentBatchLimit;
        newMetadata.currentFilterOffset = 0;
      } else {
        console.info(`Filtered records. ${filteredMessages.length} remaining. Formatting records for consumption...`);
      }
    // Here is the logic that retries the query.
    } while (
      rawMessages.length === newMetadata.currentBatchLimit &&
      filteredMessages.length === 0
    );

    response.messages = filteredMessages.map((message: Message) => {
      const isCall = message.type === MessageType.CALL;
      const conversationId = (message.conversation || {} as Conversation).public_id || 'test';
      let callStatus: null|'BUSY'|'COMPLETED'|'DROPPED'|'FAILED'|'NO_ANSWER' = null;

      if (isCall) {
        if (message.public_status === 'INCOMPLETE') {
          callStatus = 'DROPPED';
        } else {
          callStatus = message.public_status;
        }
      }
      return {
        // For ease of parsing, call fields are all null for text messages.
        call_duration_seconds: isCall ? message.duration : null,
        call_ended_at: isCall ? moment.utc(message.call_completed_at).toISOString() : null,
        call_initiated_at: isCall ? moment.utc(message.created_at).toISOString() : null,
        call_ringing_seconds: isCall ? moment.utc(message.call_started_at).diff(moment.utc(message.call_rang_at), 'seconds') : null,
        call_status: callStatus,
        call_talk_time_seconds: isCall ? moment.utc(message.call_completed_at).diff(moment.utc(message.call_started_at), 'seconds') : null,
        category: isCall ? 'CALL' : 'TEXT' as 'CALL'|'TEXT',
        conversation_id: conversationId,
        // This next line will need to be modified for User-to-User messaging
        direction: message.sender.type === 'USER' ? 'USER_TO_CONTACT' : 'CONTACT_TO_USER' as 'CONTACT_TO_USER'|'USER_TO_CONTACT'|'USER_TO_USER',
        display_url: `https://uplink.belunar.com/messages?cid=${conversationId}&mid=${message.public_id}&t=${moment.utc(message.updated_at).valueOf()}`,
        message_id: message.public_id,
        recipient: {
          external_number: message.recipient.physicalNumber,
          internal_number: message.recipient.phoneNumber.systemNumber,
          name: message.recipient.name || null,
        },
        sender: {
          external_number: message.sender.physicalNumber,
          internal_number: message.sender.phoneNumber.systemNumber,
          name: message.sender.name || null,
        },
        // For ease of parsing, text message fields are all null for calls.
        text_message_body: isCall ? null : message.message,
        text_message_type: isCall ? null : (message.media === '[]' ? 'SMS' : 'MEDIA') as 'MEDIA'|'SMS',
        text_message_media: isCall || message.media === '[]' ? null : message.media,
        text_message_received_at: isCall ? null : moment.utc(message.created_at).toISOString(),
      };
    });
    console.info('Formatting complete. Checking response size...');
    // If the SQL query returned fewer results than we asked for, it must be the
    // final page (unless we still need to filter out calls and texts).
    //
    // Note: If the total number of call and text results is a multiple of the
    // current batch limit, final_page will be false and will trigger an
    // unnecessary request. This should be harmless, and the next request will
    // be empty and have the final_page set to true.
    response.settings.final_page = rawMessages.length < newMetadata.currentBatchLimit;
  } else {
    console.info('Validation complete. Record sync is disabled. Checking response size...');
    response.messages = [];
    // Empty responses should always be the final page in order to prevent
    // superfluous queries.
    response.settings.final_page = true;
  }

  if (responseIsTooLarge(response, args.max_response_size_kb)) {
    console.info('Response is too large. Trimming down messages...');
    // If we have to remove more messages, this is not the final page.
    response.settings.final_page = false;

    const initialMessageLength = response.messages.length;

    while (
      response.messages.length > 1 &&
      responseIsTooLarge(response, args.max_response_size_kb)
    ) {
      response.messages.pop();
    }

    if (responseIsTooLarge(response, args.max_response_size_kb)) {
      throw new UplinkGraphQLException('max_response_size_kb is too small for the response body');
    }
    console.info(`Finished trimming messages. Will return messages 1-${response.messages.length} of ${initialMessageLength}. Updating org metadata...`);
  } else {
    console.info(`Will return messages ${response.messages.length === 0 ? '0' : 1}-${response.messages.length}. Updating org metadata...`);
  }
  // We'll bump up the filter offset for any subsequent requests so they know
  // where to start the results page.
  newMetadata.currentFilterOffset += response.messages.length;

  console.info('Old metadata', oldMetadata);
  console.info('New metadata', newMetadata);

  await ctx.Services.OrganizationService.updateDeeply({
    slug: org.id,
    [selectedIntegration]: {
        metadata: newMetadata
    }
  });
  console.info('Metadata updated. Responding...');

  return response;
};