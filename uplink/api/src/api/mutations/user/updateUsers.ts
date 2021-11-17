import { IUserAttributes } from '../../../@types';
import { Context } from '../../../context';
import { User } from '../../../models';

export default (_: any, { args }: { args: IUserAttributes[] }, ctx: Context): Promise<User[]> =>
  Promise.all(
    args.map((arg: IUserAttributes) =>
      ctx.Services.UserService.update(ctx.Context.state.organization, arg),
    ),
  );
