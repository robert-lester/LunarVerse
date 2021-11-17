import { Context } from '../../../context';
import { Conversation, Message } from '../../../models';

export default (conversation: Conversation, _: any, ctx: Context): Promise<Message[]> =>
  ctx.DataLoaders.MessageDataLoader.messageById.loadMany(conversation.messages.map(m => m.public_id));
