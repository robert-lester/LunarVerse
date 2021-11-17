import { expect } from 'chai';
import 'mocha';
import { voiceSandbox, smsSandbox } from '../../../src/lib/twilioSandbox';
import { ITwilioPurchaseResult } from '../../../src/@types';

describe('lib/twilioSandbox', () => {
  describe('voiceSandbox', () => {
    it('say returns the text', () => {
      expect(voiceSandbox.say('Hello World!')).to.equal('Hello World!');
    });
    it('dial logs the phone call and returns undefined', () => {
      expect(voiceSandbox.dial().number('+14071231234')).to.be.undefined;
    });
  });
  describe('smsSandbox', () => {
    it('messages.create returns a stringified message', async () => {
      const message = {
        body: 'This is the body',
        to: '+1231231234',
        from: '+1231231234',
      };
      const createMessage = await smsSandbox.messages.create(message);
      expect(createMessage).to.be.a('string');
      expect(createMessage).to.equal(JSON.stringify(message));
    });
    it('messages.media logs the removal of media', () => {
      expect(smsSandbox.messages.media('+14071231234').remove()).to.be.undefined;
    });
    it('availablePhoneNumbers.tollFree.list returns a list objects with fake formatted phone numbers', () => {
      const availableNumbers = smsSandbox.availablePhoneNumbers().tollFree.list();
      expect(availableNumbers).to.be.an('array');
      availableNumbers.forEach((num) => {
        expect(num).to.have.property('phoneNumber');
        expect(num.phoneNumber).to.match(/\+1[0-9]{10}/gm);
      });
    });
    it('availablePhoneNumbers.local.list returns a list objects with fake formatted phone numbers', () => {
      const availableNumbers = smsSandbox.availablePhoneNumbers().local.list();
      expect(availableNumbers).to.be.an('array');
      availableNumbers.forEach((num) => {
        expect(num).to.have.property('phoneNumber');
        expect(num.phoneNumber).to.match(/\+1[0-9]{10}/gm);
      });
    });
    it('incomingPhoneNumbers.create returns an ITwilioPurchaseResult', () => {
      const purchaseResult: ITwilioPurchaseResult = smsSandbox.incomingPhoneNumbers.create({ phoneNumber: '+14071231234' } as any);
      expect(purchaseResult).to.have.property('phoneNumber');
      expect(purchaseResult.phoneNumber).to.match(/\+1[0-9]{10}/gm);
      expect(purchaseResult).to.have.property('sid');
    });
  });
});
