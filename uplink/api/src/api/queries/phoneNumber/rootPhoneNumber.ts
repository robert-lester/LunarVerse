import { parsePhoneNumber } from '../../../lib/phoneParse';
import { Context } from '../../../context';
import { PhoneNumber } from '../../../models';
import { canView } from '../../../lib/authorization';

export default async (
  _: any,
  args: { phoneNumber?: string; id?: number },
  ctx: Context,
): Promise<PhoneNumber> => {
  let phoneNumber: PhoneNumber;
  if (args.id) {
    phoneNumber = await ctx.DataLoaders.PhoneDataLoader.phoneById.load(args.id);
  }
  if (args.phoneNumber) {
    const number = parsePhoneNumber(args.phoneNumber);
    if (number) {
      phoneNumber = await ctx.DataLoaders.PhoneDataLoader.phoneByNumber.load(number);
    }
  }
  return canView(ctx.Context.state.organization, phoneNumber) as PhoneNumber;
};
