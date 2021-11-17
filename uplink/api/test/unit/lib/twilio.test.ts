import { expect } from 'chai';
import TwilioClient from '../../../src/lib/twilio';
import {
  TwilioTestFromSmsNumbers,
  TwilioTestToSmsNumbers,
  TwilioTestSmsErrorCodes,
} from '../../../src/lib/twilio';

let twilio: TwilioClient;
describe('lib/twilio', () => {
  before(function() {
    twilio = new TwilioClient();
  });
  describe('Using Twilio to send an SMS message', () => {

    it('succeeds with a valid To and From phone number', async function() {
      const result = (await twilio.sendMessage(TwilioTestFromSmsNumbers.PassesAllValidation, 'Test test test!', TwilioTestToSmsNumbers.PassesAllValidation))[0];
      expect(result.errorCode).to.be.null;
    });
    it('fails because the From number is an invalid phone number', async function() {
      try {
        await twilio.sendMessage(TwilioTestFromSmsNumbers.InvalidPhoneNumber, 'INVALID PHONE NUMBER!', TwilioTestToSmsNumbers.PassesAllValidation);
      }
      catch (err) {
        expect(err.constructor.name).to.equal('RestException');
        expect(err.code).to.equal(TwilioTestSmsErrorCodes.InvalidFromPhoneNumber);
      }
    });
    it('fails because the From number is an not owned by your account', async function() {
      try {
        await twilio.sendMessage(TwilioTestFromSmsNumbers.NotOwnedByYou, 'NOT OWNED BY YOU!', TwilioTestToSmsNumbers.PassesAllValidation);
      }
      catch (err) {
        expect(err.constructor.name).to.equal('RestException');
        expect(err.code).to.equal(TwilioTestSmsErrorCodes.NotOwnedByYou);
      }
    });
    it('fails because the From number SMS queue is full', async function() {
      try {
        await twilio.sendMessage(TwilioTestFromSmsNumbers.SmsQueueIsFull, 'SMS QUEUE IS FULL!', TwilioTestToSmsNumbers.PassesAllValidation);
      }
      catch (err) {
        expect(err.constructor.name).to.equal('RestException');
        expect(err.code).to.equal(TwilioTestSmsErrorCodes.SmsQueueIsFull);
      }
    });
    it('fails because the To number is an invalid phone number', async function() {
      try {
        await twilio.sendMessage(TwilioTestFromSmsNumbers.PassesAllValidation, 'INVALID PHONE NUMBER!', TwilioTestToSmsNumbers.InvalidPhoneNumber);
      }
      catch (err) {
        expect(err.constructor.name).to.equal('RestException');
        expect(err.code).to.equal(TwilioTestSmsErrorCodes.InvalidToPhoneNumber);
      }
    });
    it('fails internally because the To number is an invalid phone number', async function() {
      try {
        await twilio.sendMessage(TwilioTestFromSmsNumbers.PassesAllValidation, 'INVALID PHONE NUMBER!', 'lunar');
      }
      catch (err) {
        expect(err.constructor.name).to.equal('Error');
        expect(err.message).to.equal('Incorrect phone number format');
      }
    });
    it('fails because Twilio cannot route the number', async function() {
      try {
        await twilio.sendMessage(TwilioTestFromSmsNumbers.PassesAllValidation, 'CANNOT ROUTE!', TwilioTestToSmsNumbers.CannotRoute);
      }
      catch (err) {
        expect(err.constructor.name).to.equal('RestException');
        expect(err.code).to.equal(TwilioTestSmsErrorCodes.CannotRoute);
      }
    });
    it('fails because Twilio account does not have international permissions', async function() {
      try {
        await twilio.sendMessage(TwilioTestFromSmsNumbers.PassesAllValidation, 'NO INTERNATIONAL!', TwilioTestToSmsNumbers.NoInternational);
      }
      catch (err) {
        expect(err.constructor.name).to.equal('RestException');
        expect(err.code).to.equal(TwilioTestSmsErrorCodes.NoInternational);
      }
    });
    it('fails because the number is blacklisted', async function() {
      try {
        await twilio.sendMessage(TwilioTestFromSmsNumbers.PassesAllValidation, 'BLACKLISTED!', TwilioTestToSmsNumbers.Blacklisted);
      }
      catch (err) {
        expect(err.constructor.name).to.equal('RestException');
        expect(err.code).to.equal(TwilioTestSmsErrorCodes.Blacklisted);
      }
    });
    it('fails because the number cannot receive messages', async function() {
      try {
       await twilio.sendMessage(TwilioTestFromSmsNumbers.PassesAllValidation, 'CANNOT RECEIVE MESSAGES!', TwilioTestToSmsNumbers.NotSmsCapable);
      }
      catch (err) {
        expect(err.constructor.name).to.equal('RestException');
        expect(err.code).to.equal(TwilioTestSmsErrorCodes.NotSmsCapable);
      }
    });
  });
  describe('get a voice response', () => {
    it('returns a voice response', async () => {
      const voiceResponse = await twilio.getVoiceResponse();
      expect(voiceResponse).to.have.property('response');
    });
  });
  describe('Validates a request to see if its from Twilio', () => {
    it('returns a false boolean because the request is not from Twilio', async () => {
      const context = {
        request: {
          header: { 'x-twilio-signature': '0/KCTR6DLpKmkAf8muzZqo1nDgQ=' },
          href: '',
          body: '',
        },
      };
      const request = await twilio.validRequest(context as any);
      expect(request).to.be.false;
    });
    it('throws an error if the Context does not have the required fields', async () => {
      const badContext = {};
      try {
        await twilio.validRequest(badContext as any);
      } catch (err) {
        expect(err.constructor.name).to.equal('TypeError');
      }
    });
  });
});
