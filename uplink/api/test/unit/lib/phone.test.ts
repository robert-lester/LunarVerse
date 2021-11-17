import { expect } from 'chai';
import {
  parsePhoneNumber,
  formatPhoneNumber,
  isCACountryCode,
  isCountryCode,
  isUSCountryCode,
  validatePhoneNumber,
} from '../../../src/lib/phoneParse';

describe('lib/phoneParse', () => {

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
    it('replaces the spaces and returns a phone number in form of "+1XXXXXXXXXX"', done => {
      const test = parsePhoneNumber('352 555 - 1893');
      expect(test).to.equal('+13525551893');
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

  describe('#isCountryCode', () => {
    it('returns true if phone number has the country code provided', done => {
      const usPhone = '+14073332222';
      const usCode = isCountryCode(usPhone, 'US');
      expect(usCode).to.equal(true);
      done();
    });
    it('returns false if the phone number does not have the country code provided', done => {
      const nonUSPhone = '+24073332222';
      const nonUSCode = isCountryCode(nonUSPhone, 'US');
      expect(nonUSCode).to.equal(false);
      done();
    });
  });
  describe('#isUSCountryCode', () => {
    it('returns true if phone number matches the US country code', done => {
      const usPhone = '+14073332222';
      const usCode = isUSCountryCode(usPhone);
      expect(usCode).to.equal(true);
      done();
    });
    it('returns false if phone number does not match the US country code', done => {
      const nonUSPhone = '+124073332222';
      const nonUSCode = isUSCountryCode(nonUSPhone);
      expect(nonUSCode).to.equal(false);
      done();
    });
  });
  describe('#isCACountryCode', () => {
    it('returns true if phone number matches the CA country code', done => {
      const caPhone = '+19023332222';
      const caCode = isCACountryCode(caPhone);
      expect(caCode).to.equal(true);
      done();
    });
    it('returns false if phone number does not match the CA country code', done => {
      const nonCAPhone = '+124073332222';
      const nonCACode = isCACountryCode(nonCAPhone);
      expect(nonCACode).to.equal(false);
      done();
    });
  });
  describe('#validatePhoneNumber', () => {
    it('returns true if phone number is a valid US number', done => {
      const usPhone = validatePhoneNumber('2133734253');
      expect(usPhone).to.equal(true);
      done();
    });
    it('returns false if phone number is not a valid US number', done => {
      const nonUsPhone = validatePhoneNumber('15555559230');
      expect(nonUsPhone).to.equal(false);
      done();
    });
    it('returns false if phone number is not a valid phone number', done => {
      const nonUsPhone = validatePhoneNumber('07624369230');
      expect(nonUsPhone).to.equal(false);
      done();
    });
    it('returns true if phone number is a valid CA number', done => {
      const caPhone = validatePhoneNumber('2133734253');
      expect(caPhone).to.equal(true);
      done();
    });
    it('returns false if phone number is not a valid CA number', done => {
      const nonCaPhone = validatePhoneNumber('+1 213 373 4');
      expect(nonCaPhone).to.equal(false);
      done();
    });
  });
});
