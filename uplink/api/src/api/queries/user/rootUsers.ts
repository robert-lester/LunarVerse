import { Context } from '../../../context';
import { User } from '../../../models';

export default async (_: any, args: any, ctx: Context): Promise<User[]> => {
  let users = await ctx.Services.UserService.index(ctx.Context.state.organization);
  if (typeof(args.assigned) !== 'undefined'){
    users = users.filter(user => user.assigned === args.assigned);
  }
  if (args.type){
    users = users.filter(user => user.type === args.type);
  }
  return users;
};
