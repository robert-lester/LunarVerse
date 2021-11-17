import { Context } from '../../../context';
import { parsePhoneNumber } from '../../../lib/phoneParse';
import { User } from '../../../models';
import { canView } from '../../../lib/authorization';
import { ResourceNotFound } from '../../exceptions/ResourceNotFound';

export default async (_: any, args: { phoneNumber?: string }, ctx: Context): Promise<User> => {
  const phoneNumber = parsePhoneNumber(args.phoneNumber);
  if (phoneNumber) {
    const user = await ctx.DataLoaders.UserDataLoader.userByPhysicalNumber.load(phoneNumber);

    if (!user || !canView(ctx.Context.state.organization, user)){
      throw new ResourceNotFound('Cannot find user');
    }
    return user;
  }
  throw new ResourceNotFound('Cannot find user');
};
