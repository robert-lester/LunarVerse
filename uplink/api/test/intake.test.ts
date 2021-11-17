// /**
//  * Tests for Intake Controller
//  */

import * as supertest from 'supertest';
import { expect } from 'chai';

const request = supertest('http://localhost:3001/intake');

describe('Intake Handler', () => {
  describe('#voice', () => {
    it('routes call to the correct phone number', done => {
      const requestBody = {
        Called: '+16303608438',
        ToState: 'IL',
        CallerCountry: 'US',
        Direction: 'inbound',
        CallerState: 'FL',
        ToZip: '60558',
        CallSid: 'CAeaecc6d82bdd27dad7c791228fad6d56',
        To: '+16303608438',
        CallerZip: '32751',
        ToCountry: 'US',
        ApiVersion: '2010-04-01',
        CalledZip: '60558',
        CalledCity: 'LA GRANGE PARK',
        CallStatus: 'ringing',
        From: '+14072057316',
        AccountSid: 'ACe0cb42e1ed00756c6e9f93a607d4ee6a',
        CalledCountry: 'US',
        CallerCity: 'MAITLAND',
        Caller: '+14072057316',
        FromCountry: 'US',
        ToCity: 'LA GRANGE PARK',
        FromCity: 'MAITLAND',
        CalledState: 'IL',
        FromZip: '32751',
        FromState: 'FL',
      };
      request
        .post('/voice')
        .send(requestBody)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
    it('handles errors to unreachable users', done => {
      const requestBody = {
        Called: '+16305558438',
        ToState: 'IL',
        CallerCountry: 'US',
        Direction: 'inbound',
        CallerState: 'FL',
        ToZip: '60558',
        CallSid: 'CAeaecc6d82bdd27dad7c791228fad6d56',
        To: '+16305558438',
        CallerZip: '32751',
        ToCountry: 'US',
        ApiVersion: '2010-04-01',
        CalledZip: '60558',
        CalledCity: 'LA GRANGE PARK',
        CallStatus: 'ringing',
        From: '+14072057316',
        AccountSid: 'ACe0cb42e1ed00756c6e9f93a607d4ee6a',
        CalledCountry: 'US',
        CallerCity: 'MAITLAND',
        Caller: '+14072057316',
        FromCountry: 'US',
        ToCity: 'LA GRANGE PARK',
        FromCity: 'MAITLAND',
        CalledState: 'IL',
        FromZip: '32751',
        FromState: 'FL',
      };
      request
        .post('/voice')
        .send(requestBody)
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('#text', () => {
    it('sets the correct headers', done => {
      const requestBody = {
        ToCountry: 'US',
        ToState: 'IL',
        SmsMessageSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        NumMedia: '0',
        ToCity: 'LA GRANGE PARK',
        FromZip: '32751',
        SmsSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        FromState: 'FL',
        SmsStatus: 'received',
        FromCity: 'MAITLAND',
        Body: 'test incoming message',
        FromCountry: 'US',
        To: '+16303608438',
        ToZip: '60558',
        NumSegments: '1',
        MessageSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        AccountSid: 'ACe0cb42e1ed00756c6e9f93a607d4ee6a',
        From: '+14072057316',
        ApiVersion: '2010-04-01',
      };
      request
        .post('/text')
        .send(requestBody)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.header['content-type']).to.equal('text/xml; charset=utf-8');
          expect(res.header['charset']).to.equal('utf-8');
          expect(res.header['access-control-allow-origin']).to.equal('*');
          done();
        });
    });
    it('sends text to correct user', done => {
      const requestBody = {
        ToCountry: 'US',
        ToState: 'IL',
        SmsMessageSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        NumMedia: '0',
        ToCity: 'LA GRANGE PARK',
        FromZip: '32751',
        SmsSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        FromState: 'FL',
        SmsStatus: 'received',
        FromCity: 'MAITLAND',
        Body: 'test incoming message',
        FromCountry: 'US',
        To: '+16303608438',
        ToZip: '60558',
        NumSegments: '1',
        MessageSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        AccountSid: 'ACe0cb42e1ed00756c6e9f93a607d4ee6a',
        From: '+14072057316',
        ApiVersion: '2010-04-01',
      };

      request
        .post('/text')
        .send(requestBody)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.be.a('string');
          expect(res.text).to.equal('Message sent');
          done();
        });
    });
    it('returns 400 on unknown number', done => {
      const requestBody = {
        ToCountry: 'US',
        ToState: 'IL',
        SmsMessageSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        NumMedia: '0',
        ToCity: 'LA GRANGE PARK',
        FromZip: '32751',
        SmsSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        FromState: 'FL',
        SmsStatus: 'received',
        FromCity: 'MAITLAND',
        Body: 'test incoming message',
        FromCountry: 'US',
        To: '+16305558438',
        ToZip: '60558',
        NumSegments: '1',
        MessageSid: 'SM23ae2e41f6b7ed20e800b8333a66b8f9',
        AccountSid: 'ACe0cb42e1ed00756c6e9f93a607d4ee6a',
        From: '+14072057316',
        ApiVersion: '2010-04-01',
      };

      request
        .post('/text')
        .send(requestBody)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.be.a('string');
          expect(res.text).to.equal('The request was invalid');
          done();
        });
    });
    it('returns 400 if the request did not come from Twilio', async done => {
      const requestBody = {
        To: '+18502045797',
        From: '+13215077468',
        Body: 'Test'
      };

      // TODO: Need to find a way to set IS_OFFLINE to false when running
      // sls offline to make the test pass.
      request
        .post('/text')
        .send(requestBody)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.text).to.be.a('string');
          expect(res.text).to.equal('Invalid request');
          done();
        });
    });
  });
});
