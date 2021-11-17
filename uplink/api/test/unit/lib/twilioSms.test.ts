import { expect } from 'chai';
import TwilioClient from '../../../src/lib/twilio';
import { TwilioTestFromSmsNumbers, TwilioTestToSmsNumbers, TwilioTestSmsErrorCodes } from '../../../src/lib/twilio';

let twilio: TwilioClient;

describe('#Using Twilio to send an SMS message', () => {
    before(function() {
        twilio = new TwilioClient();
    });

    it('succeeds with a valid To and From phone number', async function() {
        const result = (await twilio.sendMessage(TwilioTestFromSmsNumbers.PassesAllValidation, 'Test test test!', TwilioTestToSmsNumbers.PassesAllValidation))[0];
        // console.log(`Result: ${JSON.stringify(result, null, 4)}`);
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