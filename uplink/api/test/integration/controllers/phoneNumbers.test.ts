import * as supertest from 'supertest';
import { expect } from 'chai';

const request = supertest('http://localhost:3001');

describe('controllers/phoneNumbers', function() {
  describe('updatePhoneNumbers', function() {
    it('unassigns a phone number by id', function(done) {
      request
        .post('/api')
        .send({
          query: `mutation {
            updatePhoneNumbers(args: [{ id: 23, assigned_id: null, type: UNASSIGNED }]) {
              id
            }
          }`,
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text);
          expect(apiResponse.data.updatePhoneNumbers[0].id).to.equal(23);
          done();
        });
    });
    it('assigns a phone number by id', function(done) {
      request
        .post('/api')
        .send({
          query: `mutation {
            updatePhoneNumbers(args: [{ id: 23, assigned_id: 3, type: USER }]) {
              id
            }
          }`,
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text);
          expect(apiResponse.data.updatePhoneNumbers[0].id).to.equal(23);
          done();
        });
    });
    it('throws an error if the org of the phone number is in a different org than the request', function(done) {
      request
        .post('/api')
        .send({
          query: `mutation {
            updatePhoneNumbers(args: [{ id: 1, assigned_id: null, type: UNASSIGNED }]) {
              id
            }
          }`,
        })
        .set('organization_id', 'myrandomorg')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { errors } = res.body;
          const [error] = errors;
          expect(errors).to.be.instanceof(Array);
          expect(error.message).to.equal('You cannot update a phone number in a different org');
          done();
        });
    });
  });
});