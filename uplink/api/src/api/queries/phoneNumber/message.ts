import { Context } from '../../../context';
import { Message, PhoneNumber } from '../../../models';

export default (phoneNumber: PhoneNumber, args: any, ctx: Context): Promise<Message[]> =>
  ctx.DataLoaders.MessageDataLoader.messageById.loadMany(phoneNumber.messages.map(m => m.public_id));
