/**
 * Tests for utility functions
 */

import { expect } from 'chai';
import { sameDay, withinDateRange, mergeObj } from '../../../src/lib/mapping';
import { parsePhoneNumber, formatPhoneNumber } from '../../../src/lib/phoneParse';

describe('utlity functions', () => {
  describe('#sameDay', () => {
    it('returns true if dates are the same', done => {
      const date1 = new Date().toString();
      const date2 = date1;
      const check = sameDay(date1, date2);
      expect(check).to.equal(true);
      done();
    });
    it('returns false if dates are not the same', done => {
      const date1 = new Date().toString();
      const date2 = new Date('02/02/18').toString();
      const check = sameDay(date1, date2);
      expect(check).to.equal(false);
      done();
    });
  });

  describe('#withinDateRange', () => {
    it('returns true if date is within a specific range', done => {
      const final = new Date().toString();
      const initial = new Date(Date.now() - 48 * 3600 * 1000).toString();
      const checkDate = new Date(Date.now() - 24 * 3600 * 1000).toString();
      const check = withinDateRange(initial, final, checkDate);
      expect(check).to.equal(true);
      done();
    });
    it('returns false if date is not within a specific range', done => {
      const final = new Date().toString();
      const checkDate = new Date(Date.now() - 24 * 3600 * 1000).toString();
      const check = withinDateRange(final, final, checkDate);
      expect(check).to.equal(false);
      done();
    });
  });

  describe('#mergeObj', () => {
    it('merges objects and duplicate object properties', done => {
      const obj1 = {
        query: {
          firstQuery: 'test1',
        },
      };
      const obj2 = {
        query: {
          secondQuery: 'test2',
        },
      };
      const test = mergeObj({}, obj1, obj2);
      expect(test).to.be.instanceof(Object);
      expect(test).to.have.keys('query');
      expect(test.query).to.have.keys('firstQuery', 'secondQuery');
      done();
    });
  });

  describe('#parsePhoneNumber', () => {
    it('returns phone number in form of "+1XXXXXXXXXX"', done => {
      const test = parsePhoneNumber('352-555-1893');
      expect(test).to.equal('+13525551893');
      done();
    });
    it('returns null on bad phone numbers', done => {
      const test = parsePhoneNumber('352-555');
      expect(test).to.be.a('null');
      done();
    });
  });

  describe('#formatPhoneNumber', () => {
    it('returns phone number in form (XXX) XXX-XXXX', done => {
      const test = formatPhoneNumber('+13525551893');
      expect(test).to.equal('(352) 555-1893');
      done();
    });
  });
});
