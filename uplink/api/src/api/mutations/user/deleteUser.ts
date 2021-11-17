import { Context } from '../../../context';

export default (_: any, args: { id?: number }, ctx: Context): Promise<boolean> =>
  ctx.Services.UserService.delete(ctx.Context.state.organization, args.id);
