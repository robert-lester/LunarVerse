import { Context } from '../../../context';
import { PhoneNumber, User } from '../../../models';

export default async (user: User, _: any, ctx: Context): Promise<PhoneNumber> => {
  return user.phoneNumber && ctx.DataLoaders.PhoneDataLoader.phoneByUser.load(user.id);
};
