import { IPhoneNumberAttributes } from '../../../@types';
import { Context } from '../../../context';
import { PhoneNumber } from '../../../models';

export default (
  _: any,
  { args }: { args: [IPhoneNumberAttributes] },
  ctx: Context,
): Promise<PhoneNumber[]> => {
    return Promise.all(
        args.map(arg => ctx.Services.PhoneService.update(ctx.Context.state.organization, arg))
    );
};
