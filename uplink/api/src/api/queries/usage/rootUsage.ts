import { Context } from '../../../context';
import {
  DateRange,
  DirectionType,
  IUsage,
  IUsageByPhone,
  IUsageDetails,
} from '../../../@types';
import {
  totalReducer,
  buildUsageDates,
  concatCountsByDate,
} from '../../../lib/usage';
import { parsePhoneNumber } from '../../../lib/phoneParse';

export default async (
  _: any,
  args: { dateRange?: DateRange; phoneNumbers?: string[] },
  ctx: Context,
): Promise<IUsage> => {
  const org = ctx.Context.state.organization;
  let usageByPhone: IUsageByPhone[] = [];
  // if no date range is passed in, default to the beginning of the month to the end of the month
  if (!args.dateRange) {
    const now = new Date();
    args.dateRange = {
      initial: new Date(now.getFullYear(), now.getMonth(), 1),
      final: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  } else {
    args.dateRange = {
      initial: new Date(args.dateRange.initial),
      final: new Date(args.dateRange.final),
    };
  }

  // if the date range includes a date that is beyond today, change it to today -- to avoid error
  if (args.dateRange.final > new Date()) {
    const now = new Date();
    args.dateRange.final = now;
  }

  if (args.phoneNumbers && args.phoneNumbers.length) {
    // findBetweenDates needs the id of the phone number, so we grab it from the PhoneService
    const userPhones = await ctx.Services.PhoneService.findByNumbers(org, args.phoneNumbers);
    usageByPhone = await Promise.all(
      args.phoneNumbers.map(async p => {
        const phone_ids = userPhones
          .filter(up => up.systemNumber === parsePhoneNumber(p))
          .map(up => up.id);

        if (phone_ids.length > 1) {
          console.error(`Found duplicate System Number ${parsePhoneNumber(p)} for User Ids ${phone_ids}`);
        }

        // If no phone ids were found for the given phone number
        if (!phone_ids.length) {
          console.log('No ids found. return empty usage details');
          return {
            systemNumber: p,
            message: {
              inBound: buildUsageDates([], args.dateRange.initial, args.dateRange.final),
              outBound: buildUsageDates([], args.dateRange.initial, args.dateRange.final),
              inBoundSMS: buildUsageDates([], args.dateRange.initial, args.dateRange.final),
              outBoundSMS: buildUsageDates([], args.dateRange.initial, args.dateRange.final),
              inBoundMediaMessages: buildUsageDates([], args.dateRange.initial, args.dateRange.final),
              outBoundMediaMessages: buildUsageDates([], args.dateRange.initial, args.dateRange.final),
            },
            voice: {
              inBound: buildUsageDates([], args.dateRange.initial, args.dateRange.final),
              outBound: buildUsageDates([], args.dateRange.initial, args.dateRange.final),
            },
          };
        }

        console.log('outbound media messages');
        const phoneOutBoundMediaMessage = buildUsageDates(await ctx.Services.MessageService.findMediaMessagesBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.OUTBOUND, phone_ids), args.dateRange.initial, args.dateRange.final);
        console.log('inbound media messages');
        const phoneInBoundMediaMessage = buildUsageDates(await ctx.Services.MessageService.findMediaMessagesBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.INBOUND, phone_ids), args.dateRange.initial, args.dateRange.final);
        console.log('outbound sms');
        const phoneOutBoundSMS = buildUsageDates(await ctx.Services.MessageService.findSMSBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.OUTBOUND, phone_ids), args.dateRange.initial, args.dateRange.final);
        console.log('inbound sms');
        const phoneInBoundSMS = buildUsageDates(await ctx.Services.MessageService.findSMSBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.INBOUND, phone_ids), args.dateRange.initial, args.dateRange.final);
        console.log('outbound voice calls');
        const phoneOutBoundCalls = buildUsageDates(await ctx.Services.MessageService.findCallsBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.OUTBOUND, phone_ids), args.dateRange.initial, args.dateRange.final);
        console.log('inbound voice calls');
        const phoneInBoundCalls = buildUsageDates(await ctx.Services.MessageService.findCallsBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.INBOUND, phone_ids), args.dateRange.initial, args.dateRange.final);
        console.log('outbound total');
        const phoneOutBound = concatCountsByDate(phoneOutBoundSMS, phoneOutBoundMediaMessage);
        console.log('inbound total');
        const phoneInBound = concatCountsByDate(phoneInBoundSMS, phoneInBoundMediaMessage);

        return {
          systemNumber: p,
          message: {
            inBound: phoneInBound,
            outBound: phoneOutBound,
            inBoundSMS: phoneInBoundSMS,
            outBoundSMS: phoneOutBoundSMS,
            inBoundMediaMessages: phoneInBoundMediaMessage,
            outBoundMediaMessages: phoneOutBoundMediaMessage,
          },
          voice: {
            inBound: phoneInBoundCalls,
            outBound: phoneOutBoundCalls,
          },
        };
      }),
    );
  }

  const allInBoundSMS = buildUsageDates(await ctx.Services.MessageService.findSMSBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.INBOUND, []), args.dateRange.initial, args.dateRange.final);
  const allOutBoundSMS = buildUsageDates(await ctx.Services.MessageService.findSMSBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.OUTBOUND, []), args.dateRange.initial, args.dateRange.final);
  const allInBoundMediaMessages = buildUsageDates(await ctx.Services.MessageService.findMediaMessagesBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.INBOUND, []), args.dateRange.initial, args.dateRange.final);
  const allOutBoundMediaMessages = buildUsageDates(await ctx.Services.MessageService.findMediaMessagesBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.OUTBOUND, []), args.dateRange.initial, args.dateRange.final);
  const allInBoundVoice = buildUsageDates(await ctx.Services.MessageService.findCallsBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.INBOUND, []), args.dateRange.initial, args.dateRange.final);
  const allOutBoundVoice = buildUsageDates(await ctx.Services.MessageService.findCallsBetweenDates(org, args.dateRange.initial, args.dateRange.final, DirectionType.OUTBOUND, []), args.dateRange.initial, args.dateRange.final);
  const allInBoundMessages = concatCountsByDate(allInBoundSMS, allInBoundMediaMessages);
  const allOutBoundMessages = concatCountsByDate(allOutBoundSMS, allOutBoundMediaMessages);

  let inBoundMessages: IUsageDetails[];
  let outBoundMessages: IUsageDetails[];
  let inBoundSMS: IUsageDetails[];
  let outBoundSMS: IUsageDetails[];
  let inBoundMediaMessages: IUsageDetails[];
  let outBoundMediaMessages: IUsageDetails[];
  let inBoundVoice: IUsageDetails[];
  let outBoundVoice: IUsageDetails[];

  // Use the usageyPhone data if it exists
  if (usageByPhone.length) {
    const phoneAllInboundMessages = [];
    const phoneAllOutboundMessages = [];
    const phoneInboundSMS = [];
    const phoneOutboundSMS = [];
    const phoneInboundMediaMessages = [];
    const phoneOutBoundMediaMessages = [];
    const phoneInboundVoice = [];
    const phoneOutboundVoice = [];

    // push the count of each field into a new array
    usageByPhone.forEach((phone) => {
      phoneAllInboundMessages.push(totalReducer(phone.message.inBound));
      phoneAllOutboundMessages.push(totalReducer(phone.message.outBound));
      phoneInboundSMS.push(totalReducer(phone.message.inBoundSMS));
      phoneOutboundSMS.push(totalReducer(phone.message.outBoundSMS));
      phoneInboundMediaMessages.push(totalReducer(phone.message.inBoundMediaMessages));
      phoneOutBoundMediaMessages.push(totalReducer(phone.message.outBoundMediaMessages));
      phoneInboundVoice.push(totalReducer(phone.voice.inBound));
      phoneOutboundVoice.push(totalReducer(phone.voice.outBound));
    });

    // Set phone data as the new total data
    inBoundMessages = phoneAllInboundMessages;
    outBoundMessages = phoneAllOutboundMessages;
    inBoundSMS = phoneInboundSMS;
    outBoundSMS = phoneOutboundSMS;
    inBoundMediaMessages = phoneInboundMediaMessages;
    outBoundMediaMessages = phoneOutBoundMediaMessages;
    inBoundVoice = phoneInboundVoice;
    outBoundVoice = phoneOutboundVoice;
  } else {
    // Set data to all phones data
    inBoundMessages = allInBoundMessages;
    outBoundMessages = allOutBoundMessages;
    inBoundSMS = allInBoundSMS;
    outBoundSMS = allOutBoundSMS;
    inBoundMediaMessages = allInBoundMediaMessages;
    outBoundMediaMessages = allOutBoundMediaMessages;
    inBoundVoice = allInBoundVoice;
    outBoundVoice = allOutBoundVoice;
  }

  return {
    usage: {
      message: {
        inBound: allInBoundMessages,
        outBound: allOutBoundMessages,
        inBoundSMS: allInBoundSMS,
        inBoundMediaMessages: allInBoundMediaMessages,
        outBoundSMS: allOutBoundSMS,
        outBoundMediaMessages: allOutBoundMediaMessages,
      },
      voice: {
        inBound: allInBoundVoice,
        outBound: allOutBoundVoice,
      },
    },
    usageByPhone,
    totals: {
      message: {
        inBound: totalReducer(inBoundMessages),
        outBound: totalReducer(outBoundMessages),
        inBoundSMS: totalReducer(inBoundSMS),
        outBoundSMS: totalReducer(outBoundSMS),
        inBoundMediaMessages: totalReducer(inBoundMediaMessages),
        outBoundMediaMessages: totalReducer(outBoundMediaMessages),
      },
      voice: {
        inBound: totalReducer(inBoundVoice),
        outBound: totalReducer(outBoundVoice),
      },
    },
  };
};
