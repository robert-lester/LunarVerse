import * as assert from 'assert';
import { expect } from 'chai';
import 'mocha';
import {
  UsageUtils,
  totalReducer,
  buildUsageDates,
  concatCountsByDate,
 } from '../../../src/lib/usage';
import { IUsageDetails } from '../../../src/@types';

describe('lib/usage', () => {
  describe('UsageUtils', () => {
    describe('getBillingCycleForDate', () => {
      it('throws if date isn\'t a Date object', () => {
        assert.throws(() => UsageUtils.getBillingCycleForDate(null, 15));
        assert.throws(() => UsageUtils.getBillingCycleForDate('abc' as any, 15));
      });

      it('throws if billingDate isn\'t an Integer', () => {
        assert.throws(() => UsageUtils.getBillingCycleForDate(new Date(), 'abc' as any));
        assert.throws(() => UsageUtils.getBillingCycleForDate(new Date(), undefined));
        assert.throws(() => UsageUtils.getBillingCycleForDate(new Date(), 50.2));
        assert.throws(() => UsageUtils.getBillingCycleForDate(new Date(), Infinity));
        assert.throws(() => UsageUtils.getBillingCycleForDate(new Date(), NaN));
      });

      it('throws if billingDate is out of range', () => {
        assert.throws(() => UsageUtils.getBillingCycleForDate(new Date(), 0));
        assert.throws(() => UsageUtils.getBillingCycleForDate(new Date(), -50));
        assert.throws(() => UsageUtils.getBillingCycleForDate(new Date(), 32));
      });

      it('handles billing cycles ending in the current month properly', () => {
        assert.deepStrictEqual(UsageUtils.getBillingCycleForDate(new Date('2018-12-16'), 20), [new Date('2018-11-20'), new Date('2018-12-20')]);
      });

      it('handles billing cycles ending in the next month properly', () => {
        assert.deepStrictEqual(UsageUtils.getBillingCycleForDate(new Date('2018-12-16'), 15), [new Date('2018-12-15'), new Date('2019-01-15')]);
      });

      it('handles billing cycles starting on the current date properly', () => {
        assert.deepStrictEqual(UsageUtils.getBillingCycleForDate(new Date('2018-12-16'), 16), [new Date('2018-12-16'), new Date('2019-01-16')]);
      });

      it('handles leap years properly', () => {
        assert.deepStrictEqual(UsageUtils.getBillingCycleForDate(new Date('2019-02-15'), 29), [new Date('2019-01-29'), new Date('2019-02-28')]);
        assert.deepStrictEqual(UsageUtils.getBillingCycleForDate(new Date('2020-02-15'), 29), [new Date('2020-01-29'), new Date('2020-02-29')]);
        assert.deepStrictEqual(UsageUtils.getBillingCycleForDate(new Date('2100-02-15'), 29), [new Date('2100-01-29'), new Date('2100-02-28')]);
      });
    });
  });
  const usageDetails: IUsageDetails[] = [
    {
      count: 2,
      date: new Date('2019-01-12 00:00:00'),
    },
    {
      count: 4,
      date: new Date('2019-01-13 00:00:00'),
    },
    {
      count: 2,
      date: new Date('2019-01-14 00:00:00'),
    },
  ];
  describe('TotalReducer', () => {
    it('creates a total count by reducing an array', () => {
      const count = totalReducer(usageDetails);
      assert.deepStrictEqual(count, { count: 8 });
    });
  });
  describe('ConcatCountsByDate', () => {
    it('throws an error if arr1 is not an array with the necessary properties', () => {
      assert.throws(() => concatCountsByDate(null as any, usageDetails));
      assert.throws(() => concatCountsByDate({ count: 0, date: new Date() } as any, usageDetails));
    });
    it('throws an error if arr2 is not an array with the necessary properties', () => {
      assert.throws(() => concatCountsByDate(usageDetails, null as any));
      assert.throws(() => concatCountsByDate(usageDetails, 'string' as any));
    });
    it('Should concatenate two arrays together and increment the counts if any dates match', () => {
      const concatResults: IUsageDetails[] = [
        {
          count: 4,
          date: new Date('2019-01-12 00:00:00'),
        },
        {
          count: 8,
          date: new Date('2019-01-13 00:00:00'),
        },
        {
          count: 4,
          date: new Date('2019-01-14 00:00:00'),
        },
      ];

      assert.deepStrictEqual(concatCountsByDate(usageDetails, usageDetails), concatResults);
    });
  });
  describe('BuildUsageDates', () => {
    it('should throw an error if the start date is not a proper Date object', () => {
      assert.throws(() => buildUsageDates(usageDetails, 'date in string' as any, new Date()));
      assert.throws(() => buildUsageDates(usageDetails, null as any, new Date()));
    });
    it('should throw an error if the end date is not a proper Date object', () => {
      assert.throws(() => buildUsageDates(usageDetails, new Date(), 12 as any));
      assert.throws(() => buildUsageDates(usageDetails, new Date(), null as any));
    });
    it('Adds the missing dates to the array based on the date range', () => {
      const usageArray = buildUsageDates(usageDetails, new Date('2019-01-11'), new Date('2019-01-16'));
      const arr: IUsageDetails[] = usageDetails;
      arr.push(
        {
          count: 0,
          date: new Date('2019-01-11 00:00:00'),
        },
        {
          count: 0,
          date: new Date('2019-01-15 00:00:00'),
        },
        {
          count: 0,
          date: new Date('2019-01-16 00:00:00'),
        }
      );
      arr.sort((a, b) => a.date > b.date ? 1 : -1);

      assert.deepStrictEqual(usageArray, arr);
    });
    it('builds a usage array for any date range', () => {
      const usageArray = buildUsageDates([], new Date('2018-02-11'), new Date('2019-01-16'));
      expect(usageArray).to.be.an('array');
      usageArray.forEach((usageDetail) => {
        expect(usageDetail).to.have.property('count');
        expect(usageDetail).to.have.property('date');
      });
    });
  });
});
