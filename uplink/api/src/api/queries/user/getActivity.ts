import { Context } from '../../../context';
import { parsePhoneNumber } from '../../../lib/phoneParse';
import { Message, User } from '../../../models';
import {
  IActivity,
  MessageType,
  UserType,
} from '../../../@types';

export default async (_: any, args: { phoneNumber?: string }, ctx: Context): Promise<IActivity> => {
  let activity = {
    id: null,
    isUser: null,
    firstInBound: null,
    firstOutBound: null,
    lastInBound: null,
    lastOutBound: null,
    status: null,
    systemNumber: null,
    physicalNumber: null,
  };

  const organization = ctx.Context.state.organization;

  if (args.phoneNumber) {
    const physicalNumber = parsePhoneNumber(args.phoneNumber);

    if (physicalNumber) {
      let [user] = await ctx.Services.UserService.findContactOrUserBySystemNumber(organization, physicalNumber);

      if (! (user instanceof User)) {
        user = await ctx.Services.UserService.findContactOrUserByNumberAndOrg(organization, physicalNumber);
      }

      if (!(user instanceof User)) {
        [user] = await ctx.Services.UserService.findContactOrUserByPhysicalNumber(physicalNumber);
      }

      if (user instanceof User) {
        const conversations = await ctx.Services.ConversationService.findByContactUser([user]);

        let firstInbound;
        let firstOutbound;
        let lastInbound;
        let lastOutbound;

        const messages = conversations
        .map(c => c.messages)
        .reduce((a, b) => [...a, ...b], []) // flatten
        .sort((a: Message, b: Message) => {
          return new Date(a.created_at).valueOf() - new Date(b.created_at).valueOf();
        });

        messages.forEach(m => {
          if (m.type === MessageType.USER && m.sender.id === user.id && m.message.substring(0, 11) !== 'SYSTEM MSG:') {
            if (!firstInbound) {
              firstInbound = m;
            }
            lastInbound = m;
          }
          if (m.type === MessageType.USER && m.sender.id !== user.id) {
            if (!firstOutbound) {
              firstOutbound = m;
            }
            lastOutbound = m;
          }
        });

        activity = {
          ...activity,
          id: user.id,
          isUser: (user.type === UserType.USER),
          firstInBound: firstInbound ? firstInbound.created_at : null,
          lastInBound: lastInbound ? lastInbound.created_at : null,
          firstOutBound: firstOutbound ? firstOutbound.created_at : null,
          lastOutBound: lastOutbound ? lastOutbound.created_at : null,
          status: true,
          systemNumber: (user.phoneNumber) ? user.phoneNumber.systemNumber : null,
          physicalNumber: user.physicalNumber,
        };
      }
    }
  }

  return activity;
};
