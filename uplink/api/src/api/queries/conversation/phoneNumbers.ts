import { Context } from '../../../context';
import { Conversation, PhoneNumber } from '../../../models';

export default async (conversation: Conversation, _: any, ctx: Context): Promise<PhoneNumber[]> => {
  const contactUser = await ctx.DataLoaders.UserDataLoader.userById.load(conversation.contact_user_id);
  const phoneNumbers = [conversation.user_phone_id];
  if (contactUser.phoneNumber){
    phoneNumbers.push(contactUser.phoneNumber.id);
  }
  return ctx.DataLoaders.PhoneDataLoader.phoneById.loadMany(phoneNumbers);
};
