import * as moment from 'moment';
import { Context } from '../../../context';
import { canView } from '../../../lib/authorization';
import { IConversationMessageAttributes, IConversationLoader } from '../../../@types';
import { Message } from '../../../models';
import { UplinkGraphQLException } from '../../exceptions/UplinkGraphQLException';

export default async (
  _: any,
  args: {
    attributes: IConversationMessageAttributes,
    finalDate: string,
    id?: number,
    public_id?: string,
  },
  ctx: Context,
): Promise<IConversationLoader> => {
  const { finalDate, attributes } = args;

  if (args.id && args.public_id) {
    throw new UplinkGraphQLException('Cannot use both id and public_id');
  } else if (!args.id && !args.public_id) {
    // TODO: Investigate if we can throw a proper error in the future
    // Returning null for backwards compatibility
    return null;
  }
  const byFallbackId = !!args.id;

  // finalDate is not required due to backwards compatibility
  if (finalDate && !moment(finalDate, 'YYYY-MM-DDTHH:mm:ss.sssZ', true).isValid()) {
    throw new UplinkGraphQLException('Invalid Date');
  }

  const attributesDefault: IConversationMessageAttributes = {
    messageCount: 0,
    offset: 0,
  };

  const org = ctx.organization;
  let conversation: IConversationLoader;

  if (byFallbackId) {
    conversation = await ctx.Services.ConversationService.readSingle(org, args.id);
  } else {
    conversation = await ctx.Services.ConversationService.readByPublicId(org, args.public_id);
  }

  if (!conversation) {
    throw new Error('Conversation does not exist');
  }

  // Format to MySQL datetime
  const finalDateTime = finalDate ? moment(finalDate).utc().format('YYYY-MM-DD HH:mm:ss') : null;
  let { messageCount, offset } = attributesDefault;

  if (attributes && attributes.messageCount) {
    messageCount = attributes.messageCount;
  }
  if (attributes && attributes.offset) {
    offset = attributes.offset;
  }

  // Add the request parameters to the reponse
  conversation.finalDate = finalDate;
  conversation.messageCount = messageCount;
  conversation.offset = offset;

  const messagesByDate: Message[] = await ctx.Services.MessageService.findMessagesByDate(org, conversation.id, finalDateTime, messageCount, offset);

  conversation.messages = messagesByDate;

  return canView(org, conversation) as IConversationLoader;
};
