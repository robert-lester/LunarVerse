import * as Joi from 'joi';
import * as Knex from 'knex';
import { IUsageTotals, IUsageDetails } from '../@types';
import * as moment from 'moment';

export abstract class UsageUtils {
  private static cloneMonthOffset(date: Date, offset: number) {
    return new Date(date.getFullYear(), date.getMonth() + offset);
  }

  private static getBillingDateForMonth(date: Date, billingDate: number) {
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), Math.min(billingDate, lastDayOfMonth), 0, 0, 0, 0));
  }

  public static getBillingCycleForDate(date: Date, billingDate: number): [Date, Date] {
    if (!(date instanceof Date)) {
      throw new TypeError('date must be a Date object');
    } else if (!Number.isInteger(billingDate)) {
      throw new TypeError('billingDate must be an integer');
    } else if (billingDate < 1 || billingDate > 31) {
      throw new RangeError('billingDate must be between 1 and 31');
    }

    if (date.getUTCDate() < billingDate) {
      return [
        UsageUtils.getBillingDateForMonth(UsageUtils.cloneMonthOffset(date, -1), billingDate),
        UsageUtils.getBillingDateForMonth(date, billingDate),
      ];
    }
    return [
      UsageUtils.getBillingDateForMonth(date, billingDate),
      UsageUtils.getBillingDateForMonth(UsageUtils.cloneMonthOffset(date, 1), billingDate),
    ];
  }
}

/**
 * This abstraction exists so we can guarantee that all usage-based queries
 * (billing, activity, plan) use consistent logic and dates line up properly
 */
export const getBillableUnitsQueryBuilder = (knex: Knex) => (
  orgs: Array<string>,
  startDate: Date,
  endDate: Date,
) => knex('messages')
  .select(knex.raw('organization_id, DATE(messages.created_at) AS date, SUM(billable_units) AS count'))
  .whereIn('organization_id', orgs)
  .andWhere('created_at', '>=', moment(startDate).utc().format('YYYY-MM-DD'))
  .andWhere('created_at', '<', moment(endDate).utc().add(1, 'day').format('YYYY-MM-DD'));

export const totalReducer = (arr: IUsageDetails[]): IUsageTotals => ({
  count: arr.reduce((acc: number, block: IUsageDetails) => acc + block.count, 0),
});

// Builds out an array with every day in the date range.
// If the array has a date that exists in the range, it replaces the date count
// with the correct count. Dates without counts default to 0.
export const buildUsageDates = (arr: IUsageDetails[], startDate: Date, endDate: Date) => {
  if (!(startDate instanceof Date)) {
    throw new TypeError('startDate must be a Date object');
  }
  if (!(endDate instanceof Date)) {
    throw new TypeError('endDate must be a Date object');
  }

  const [ startYear, startMonth, startDay ] = startDate.toISOString().split('T')[0].split('-');
  const [ endYear, endMonth, endDay ] = endDate.toISOString().split('T')[0].split('-');
  let start = new Date(parseInt(startYear, 10), parseInt(startMonth, 10) - 1, parseInt(startDay, 10), 0, 0, 0, 0);
  const end = new Date(parseInt(endYear, 10), parseInt(endMonth, 10) - 1, parseInt(endDay, 10), 0, 0, 0, 0);
  const days: Array<IUsageDetails> = [];
  const dateObject = {};

  arr.forEach((message) => {
    const date = message.date.toISOString().split('T')[0];
    dateObject[date] = message.count;
  });
  // Because the incoming ISO strings are 0-padded, the conversions to hash lookups should also be 0-padded.
  const getDateString = (date: Date): string => date.toISOString().split('T')[0];

  for (; start.getTime() <= end.getTime(); start = new Date(start.setDate(start.getDate() + 1))) {
    days.push({
      count: dateObject[getDateString(start)] || 0,
      date: new Date(start),
    });
  }

  return days;
};

export const concatCountsByDate = (arr1: IUsageDetails[], arr2: IUsageDetails[]): Array<IUsageDetails> => {
  const usageSchema = Joi.array().items(
    Joi.object({
      count: Joi.number().required(),
      date: Joi.date().required(),
    }),
  );
  Joi.assert(arr1, usageSchema);
  Joi.assert(arr2, usageSchema);

  const arr1Sorted: IUsageDetails[] = arr1.sort((a, b) => a.date > b.date ? 1 : -1);
  const arr2Sorted: IUsageDetails[] = arr2.sort((a, b) => a.date > b.date ? 1 : -1);

  return arr1Sorted
    .reduce((acc, cur, idx) => {
    acc.push({
      count: cur.count + arr2Sorted[idx].count,
      date: cur.date,
    });

    return acc;
  }, []);
};
