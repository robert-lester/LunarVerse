import * as supertest from 'supertest';
import { expect } from 'chai';
import { describe, it } from 'mocha';

const request = supertest('http://localhost:3001/intake');

// Passing arrow function to Mocha is discouraged
// https://mochajs.org/#arrow-functions
describe('Text intake handler', function() {
  it('will return a 200 from a properly formatted text intake', function(done) {
    const requestBody = {
      Body: 'Expect the moon, super chief!',
      From: '4076661234',
      To: '4704504769' // Is the system number of user "Bobby User"
    };
    request
      .post('/text')
      .send(requestBody)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
  it('Creates a conversation throw the CONVO command', done => {
    const requestBody = {
      Body: 'convo 7076002027',
      From: '19044312123',
      To: '+17542403370',
    };
    request
      .post('/text')
      .send(requestBody)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
  it('Will send a message to the new CONTACT that was just generated in the test above', done => {
    const requestBody = {
      Body: 'Test',
      From: '19044312123',
      To: '15512311227', // System number of the newly generated CONTACT 7076002027
    };
    request
      .post('/text')
      .send(requestBody)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
  it('should not send a message from a CONTACT to another CONTACT', done => {
    const requestBody = {
      Body: 'Test',
      From: '14079956649',
      To: '15512311227', // System number of the newly generated CONTACT 7076002027
    };
    request
      .post('/text')
      .send(requestBody)
      .expect(500) // TODO: Expect a 4xx status and not 500
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.be.equal('Cannot find user with that number');
        return done();
      });
  });

  it('returns an error text message to the sender if the message body is over 1600 characters', done => {
    const requestBody = {
      Body: 'This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message 123This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message 1234 This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message 12345 This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message 123456This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a very long message This is a srfrgdfgfdg dfgdfsgsdf dsfg',
      From: '+19044312123',
      To: '+15733452574',
    };
    request
      .post('/text')
      .send(requestBody)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.be.a('string');
        expect(res.text).to.equal('The message exceeds the maximum size of 1600');
        done();
      });
  });
});
