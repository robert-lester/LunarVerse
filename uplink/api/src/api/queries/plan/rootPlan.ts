import { Context } from '../../../context';
import {
  DirectionType,
  IntegrationTokens,
  IPlan,
  IPlanBase,
  PhoneType
} from '../../../@types';
import {
  totalReducer,
  UsageUtils,
} from '../../../lib/usage';
import { ResourceNotFound } from '../../exceptions/ResourceNotFound';

export default async (_: any, __: any, ctx: Context): Promise<IPlan> => {
  const org = await ctx.Services.OrganizationService.read(ctx.Context.state.organization);

  if (org === null) {
    throw new ResourceNotFound('');
  }
  const plan: IPlanBase = org.uplinkPlan;
  const tokens: IntegrationTokens = org.integrationTokens;

  if (!tokens.salesforce) {
    tokens.salesforce = { value: 'No token set' };
  } else if (!tokens.salesforce.value) {
    tokens.salesforce.value = 'No token set';
  }

  const billingDate = plan.billingStartDate.split('-').pop();
  const [ startDate, endDate ] = UsageUtils.getBillingCycleForDate(new Date(), parseInt(billingDate, 10));
  const organization = ctx.Context.state.organization;
  const sms = totalReducer(await ctx.Services.MessageService.findSMSBetweenDates(organization, startDate, endDate, DirectionType.BOTH, [])).count;
  const smsUsage = sms;
  const mediaMessages = totalReducer(await ctx.Services.MessageService.findMediaMessagesBetweenDates(organization, startDate, endDate, DirectionType.BOTH, [])).count;
  const mediaMessagesUsage = mediaMessages;
  const minutesUsage = totalReducer(await ctx.Services.MessageService.findCallsBetweenDates(organization, startDate, endDate, DirectionType.BOTH, [])).count;
  const allPhoneNumbers = await ctx.Services.PhoneService.index(ctx.Context.state.organization);
  const phoneNumbers = allPhoneNumbers.filter(p => p.type === PhoneType.USER || p.type === PhoneType.UNASSIGNED || p.type === PhoneType.FORWARD);
  const usedPhoneNumbers = allPhoneNumbers.filter(p => p.type === PhoneType.USER || p.type === PhoneType.FORWARD);

  return {
    base: plan,
    billingCycle: plan.billingCycle,
    name: plan.displayName,
    numbers: {
      included: phoneNumbers.length,
      used: usedPhoneNumbers.length,
    },
    sfToken: tokens.salesforce.value,
    usage: {
      mediaMessages: mediaMessagesUsage,
      smsMessages: smsUsage,
      voiceMinutes: minutesUsage,
    },
    usageCycle: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  };
};
