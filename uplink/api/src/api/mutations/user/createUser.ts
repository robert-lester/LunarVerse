import { Context } from '../../../context';
import { User } from '../../../models';

export default (_: any, args: any, ctx: Context): Promise<User> =>
  ctx.Services.UserService.createUser(ctx.Context.state.organization, args);
