import { ServicesContext } from '../context';
import { Conversation, PhoneNumber, User } from '../models';
import TwilioClient from './twilio';
import Logger from '../../../../lib/logger';
import SlackNotification from '../../../../lib/notifications/slack';
import {
  DirectionType,
  MediaObject,
  MessageType,
  PhoneType,
  StartConversationReferrer,
  TwilioOptInKeywords,
  TwilioOptOutKeywords,
  UserType,
  Origin
} from '../@types';
import * as Knex from 'knex';
import { formatPhoneNumber, parsePhoneNumber } from './phoneParse';

class MessageSender {
  private logger: Logger;
  private ctx: ServicesContext;
  private twilio: TwilioClient;
  static readonly MAX_MESSAGE_LENGTH = 1600;
  constructor(connection: Knex) {
    this.ctx = new ServicesContext(connection);
    // TODO: Refactor to inject the TwilioClient as a dependency
    this.twilio = new TwilioClient();
    this.logger = new Logger('uplink:lib:messageSender');
  }
  public async numberUnassigned(phoneNumber: PhoneNumber) {
    const conversations = await this.ctx.ConversationService.findByUserPhone([phoneNumber]);

    return Promise.all(conversations.map(async c => {
      this.logger.log(`This number (${phoneNumber.systemNumber}) has been unassigned`);
      return await this.ctx.MessageService.create(phoneNumber.organization_id, {
        message:  `This number (${phoneNumber.systemNumber}) has been unassigned`,
        conversation_id: c.id,
        type: MessageType.SYSTEM,
      });
    }));
  }

  public async numberAssigned(phoneNumber: PhoneNumber) {
    try {
      await this.sendMessage(phoneNumber.user.physicalNumber, phoneNumber.systemNumber, 'SYSTEM MSG: You have been assigned this Uplink Number by your administrator.');

      const conversations = await this.ctx.ConversationService.findByUserPhone([phoneNumber]);

      return Promise.all(conversations.map(async c => {
        this.logger.log('Phone number has been assigned new user. Sending user assignment message');

        return await this.ctx.MessageService.create(phoneNumber.organization_id, {
          message:  `This number (${phoneNumber.systemNumber}) has been assigned to ${phoneNumber.user.name}`,
          conversation_id: c.id,
          type: MessageType.SYSTEM,
        });
      }));
    } catch (e) {
      this.logger.log(e);
    }
  }

  public async send(originatingPhoneNumber: PhoneNumber, destinationPhoneNumber: PhoneNumber, message: string|false, type: MessageType, media: MediaObject[] = [], startConversationReferrer: StartConversationReferrer = null, origin: Origin = Origin.PHONE): Promise<string> {
    this.logger.log('sending message');
    this.logger.log('looking for conversation');
    this.logger.log('DESTINATION', destinationPhoneNumber);
    this.logger.log('ORIGINATING', originatingPhoneNumber);

    const organization = originatingPhoneNumber.organization_id;
    const destinationUser = await this.ctx.UserService.readSingle(organization, destinationPhoneNumber.user_id);
    const originatingUser = await this.ctx.UserService.readSingle(organization, originatingPhoneNumber.user_id);

    let userPhone: User|PhoneNumber;
    let contactUser: User|PhoneNumber;
    if (originatingPhoneNumber.type === PhoneType.USER){
      userPhone = originatingPhoneNumber;
      contactUser = destinationUser;
    } else {
      userPhone = destinationPhoneNumber;
      contactUser = originatingUser;
    }

    const optsData = {
      message,
      originatingUser,
      destinationUser,
    };

    await this.handleTwilioKeywords(optsData);
    const blocked = await this.verifyBlockList(optsData);

    // If blocked is true, return so it does not throw an error from Twilio about the blocked number.
    if (blocked) {
      return 'The number is blocked.';
    }

    let conversation: Conversation = await this.ctx.ConversationService.findWithPhoneNumbers(
      organization,
      userPhone,
      contactUser,
    );

    this.logger.log('CONVERSATION', conversation);

    if (!conversation || startConversationReferrer) {
      if (!conversation) {
        this.logger.log('no conversation - creating');
        // If no conversation, create a new conversation and associate the id with both users
        conversation = await this.ctx.ConversationService.create(organization, {
          user_phone_id: userPhone.id,
          contact_user_id: contactUser.id,
        });
        this.logger.log('conversation created');
      } else {
        const now = new Date().getTime();
        const oneHourAgo = now - (1 * 60 * 60 * 1000);
        const lastConversationStarted = new Date(conversation.conversation_last_started_at).getTime();
        // Notify Slack if User tries to start conversation more than once an hour.
        if (startConversationReferrer && lastConversationStarted > oneHourAgo) {
          const sendSlackMessage = new SlackNotification();
          const data = `${destinationUser.name} (Real number: ${formatPhoneNumber(destinationUser.physicalNumber)}) from \`${organization}\` has tried to start a conversation with Contact real number ${formatPhoneNumber(contactUser.physicalNumber)} multiple times within the last hour from ${startConversationReferrer}.`;
          this.logger.log('notifying slack');
          await sendSlackMessage.sendToSlack(data);
        }

        await this.ctx.ConversationService.update(organization, {
          id: conversation.id,
          conversation_last_started_at: new Date(),
        });
        this.logger.log('conversation updated');
      }

      const systemMessage = `SYSTEM MSG: You can reach ${formatPhoneNumber(contactUser.physicalNumber)} using this Uplink number.`;
      if (destinationUser.type === UserType.USER) {
        await this.ctx.MessageService.create(organization, {
          message: systemMessage,
          conversation_id: conversation.id,
          type: MessageType.USER,
          recipient_snapshot: JSON.stringify(destinationUser),
          sender_snapshot: JSON.stringify(originatingUser),
          from_phone_id: originatingPhoneNumber.id,
          to_phone_id: destinationPhoneNumber.id,
          direction: DirectionType.INBOUND,
          origin: origin
        });
        await this.twilio.sendMessage(contactUser.phoneNumber.systemNumber, systemMessage, destinationUser.physicalNumber);
        this.logger.log('introduction message sent');
      } else if (startConversationReferrer && destinationUser.type === UserType.CONTACT) {
        // Send System Message to USER if USER initiated start conversation command
        await this.ctx.MessageService.create(organization, {
          message: systemMessage,
          conversation_id: conversation.id,
          type: MessageType.USER,
          recipient_snapshot: JSON.stringify(originatingUser),
          sender_snapshot: JSON.stringify(destinationUser),
          from_phone_id: destinationPhoneNumber.id,
          to_phone_id: originatingPhoneNumber.id,
          direction: DirectionType.INBOUND,
          origin: origin
        });
        await this.twilio.sendMessage(contactUser.phoneNumber.systemNumber, systemMessage, originatingUser.physicalNumber);
        this.logger.log('introduction message sent');
      }
    }
    this.logger.log('found or created conversation');
    const originatingNumber: string = originatingPhoneNumber.systemNumber;

    this.logger.log('message');
    // Send just the image urls when sending message
    const mediaUrls = Array.isArray(media) ? media.map(medium => medium.url) : [];

    if (type !== MessageType.SYSTEM) {
      await this.ctx.ConversationService.update(organization, {
        id: conversation.id,
        updated_at: new Date(),
      });

      // This is the necessary approach when doing multiple asynchronous requests.
      // The other idioms ("for await" and "for each") were not successful due
      // to runtime issues.
      const promises = mediaUrls.map(url => this.twilio.sendMessage(originatingNumber, url, destinationUser.physicalNumber));
      await Promise.all(promises);
      let sendTwilioMessageCallback;

      if (message) {
        [sendTwilioMessageCallback] = await this.twilio.sendMessage(originatingNumber, message, destinationUser.physicalNumber);
      }
      // TODO: The reason these are separated is because Voice intake uses this function as well
      // It should be broken out in the future.
      if (message !== false) {
        // Create a new message record based on the text content
        await this.ctx.MessageService.create(organization, {
          message: message || '',
          conversation_id: conversation.id,
          media: JSON.stringify(media),
          type,
          recipient_snapshot: JSON.stringify(destinationUser),
          sender_snapshot: JSON.stringify(originatingUser),
          from_phone_id: originatingPhoneNumber.id,
          to_phone_id: destinationPhoneNumber.id,
          direction: (destinationPhoneNumber.type === PhoneType.CONTACT) ? DirectionType.OUTBOUND : DirectionType.INBOUND,
          billable_units: parseInt(sendTwilioMessageCallback ? sendTwilioMessageCallback.numSegments : 1, 10),
          origin: origin
        });
      }

      this.logger.log('message saved');
    }
    return 'Message sent';
  }

  // Checks if the message has the Twilio Opt Out Keywords to interfere with communication
  // https://support.twilio.com/hc/en-us/articles/223134027-Twilio-support-for-opt-out-keywords-SMS-STOP-filtering-
  public async checkMessageContainsTwilioKeywords(message: string, TwilioKeywords: object) {
    if (message === TwilioKeywords[message]) {
      return true;
    }
    return false;
  }

  // Calls checkMessageContainsTwilioKeywords to see if it contains
  // a Twilio Keyword. Upserts the blocklist to either blocked or unblocked if needed.
  public async handleTwilioKeywords({
    message,
    originatingUser,
    destinationUser
  }: {
    message: string | boolean,
    originatingUser: User,
    destinationUser: User
  }) {
    const messageOptsIn = await this.checkMessageContainsTwilioKeywords(message as string, TwilioOptInKeywords);
    const messageOptsOut = await this.checkMessageContainsTwilioKeywords(message as string, TwilioOptOutKeywords);

    if (messageOptsIn) {
      this.logger.log('message has opted the User/Contact into conversation');
      await this.ctx.UserService.upsertBlocklist(originatingUser.id, destinationUser.id, originatingUser.organization_id, false);
    } else {
      if (messageOptsOut) {
        this.logger.log('message has opted the User/Contact out of conversation');
        await this.ctx.UserService.upsertBlocklist(originatingUser.id, destinationUser.id, originatingUser.organization_id, true);
      }
    }
  }

  // Checks if the originatingUser is a USER.
  // If not, return false. If true, check the blocklist for the associated Ids
  // If the USER is blocked from that contact. Send a system message to USER
  // and return true.
  public async verifyBlockList({
    originatingUser,
    destinationUser
  }: {
    originatingUser: User,
    destinationUser: User
  }): Promise<boolean> {
    // If message is from a USER, check the blocklist
    if (originatingUser.type === UserType.USER) {
      this.logger.log('Check if CONTACT has blocked USER in the blocklist');
      const [dataFromBlocklist] = await this.ctx.UserService.checkBlocklistForIds(destinationUser.id, originatingUser.id);

      if (dataFromBlocklist && dataFromBlocklist.blocked) {
        this.logger.log('USER is blocked from messaging CONTACT');
        const systemMessage = `SYSTEM MSG: ${formatPhoneNumber(destinationUser.physicalNumber)} has opted out of receiving any more texts from this Uplink Number. Your message will not be delivered.`;

        await this.twilio.sendMessage(destinationUser.phoneNumber.systemNumber, systemMessage, originatingUser.physicalNumber);
        this.logger.log('System message sent');

        return true;
      }
    }
    return false;
  }

  public async sendMessage(to: string, from: string, message: string) {
    const fromPhone = parsePhoneNumber(from);
    const toPhone = parsePhoneNumber(to);
    await this.twilio.sendMessage(fromPhone, message, toPhone);
  }
}

export default MessageSender;
