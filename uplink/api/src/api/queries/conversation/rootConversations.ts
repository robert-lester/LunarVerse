import { Context } from '../../../context';
import { Conversation } from '../../../models';
import { DateRange, SortOptions } from '../../../@types';
import { parsePhoneNumber } from '../../../lib/phoneParse';
import * as moment from 'moment';
import { UplinkGraphQLException } from '../../exceptions/UplinkGraphQLException';

export default async (
  _: any,
  args: {
    phoneNumbers?: string[];
    filter?: DateRange;
    sort?: SortOptions;
  },
  ctx: Context,
): Promise<Conversation[]> => {
  // Strictly parse for Unix epoch in milliseconds
  let formattedInitial = moment(args.filter ? args.filter.initial : moment(0).format('x'), 'x', true);
  let formattedFinal = moment(args.filter ? args.filter.final : moment().format('x'), 'x', true);

  // If given no valid initial and final time, return an empty set.
  if (! formattedFinal.isValid() && ! formattedInitial.isValid()) {
    formattedInitial = moment(0);
    formattedFinal = moment();
  }
  // If given a valid final time, find all conversations from the
  // beginning of time up to the final time.
  else if (formattedFinal.isValid() && ! formattedInitial.isValid()) {
    formattedInitial = moment(0); // The Unix epoch time
  }
  // If given a valid initial time, find all conversations after the
  // initial time and up to now (inclusive).
  else if (! formattedFinal.isValid() && formattedInitial.isValid()) {
    formattedFinal = moment();
  }

  // Be certain to search from the earliest date time to the latest date time
  if (formattedInitial.isAfter(formattedFinal)) {
    const tmp = moment(formattedFinal);
    formattedFinal = formattedInitial;
    formattedInitial = tmp;
  }

  // Be certain there is a valid set of phone numbers
  // If given no valid phonenumbers, find all conversations in the time range.
  const formattedPhoneNumbers = args.phoneNumbers ? args.phoneNumbers.map(element => {
    const formattedPhoneNumber = parsePhoneNumber(element);
    if (formattedPhoneNumber == null) {
      throw new UplinkGraphQLException(`This selected number \"${element}\" is not a valid phone number.`);
    }
    return formattedPhoneNumber;
  }) : [];

  return await ctx.Services.ConversationService.find(
     ctx.organization,
     formattedPhoneNumbers,
     formattedInitial.utc().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
     formattedFinal.utc().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
     args.sort ? args.sort : SortOptions.ASC);
};