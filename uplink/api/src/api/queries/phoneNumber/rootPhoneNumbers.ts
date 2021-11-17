import { PhoneType, AssignedType } from '../../../@types';
import { Context } from '../../../context';
import { PhoneNumber } from '../../../models';
import { readPermissions } from '../../../lib/authorization';

export default async (
  _: any,
  args: {
    phoneNumbers?: number[];
    type?: [PhoneType];
    filter?: AssignedType;
    hasConversations?: boolean;
    isAssigned?: boolean;
  },
  ctx: Context,
): Promise<PhoneNumber[]> => {
  let phoneNumbers: PhoneNumber[];
  if (args.phoneNumbers && args.phoneNumbers.length) {
    phoneNumbers = await ctx.DataLoaders.PhoneDataLoader.phoneById.loadMany(args.phoneNumbers);
    phoneNumbers = readPermissions(ctx.Context.state.organization, phoneNumbers);
  } else {
    phoneNumbers = await ctx.Services.PhoneService.index(ctx.Context.state.organization);
  }
  if (args.type && args.type.length){
    phoneNumbers = phoneNumbers.filter((p: PhoneNumber) => args.type.includes(p.type));
  }

  if (args.filter === AssignedType.ASSIGNED) {
    phoneNumbers = phoneNumbers.filter((p: PhoneNumber) => p.user);
  } else if (args.filter === AssignedType.UNASSIGNED) {
    phoneNumbers = phoneNumbers.filter((p: PhoneNumber) => !p.user);
  }

  if (typeof(args.hasConversations) !== 'undefined') {
    phoneNumbers = phoneNumbers.filter((p: PhoneNumber) => p.hasConversations === args.hasConversations);
  }

  if (typeof(args.isAssigned) !== 'undefined') {
    phoneNumbers = phoneNumbers.filter((p: PhoneNumber) => p.isAssigned === args.isAssigned);
  }

  return phoneNumbers;
};
