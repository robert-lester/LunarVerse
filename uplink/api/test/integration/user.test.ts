/**
 * Tests for User type
 */

import * as supertest from 'supertest';
import { expect } from 'chai';
import { describe, it } from 'mocha';

const request = supertest('http://localhost:3001');

describe('User Type', () => {
  let newUserId: string;

  describe('#createUser', () => {
    it('creates a new user', done => {
      request
        .post('/api')
        .send({
          query: `mutation {
          createUser(name: "Bob" physicalNumber: "352-555-1893") {
            id
            name
            physicalNumber
          }
        }`,
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { createUser } = res.body.data;
          newUserId = createUser.id;
          expect(createUser).to.have.keys('id', 'name', 'physicalNumber');
          expect(createUser.name).to.eql('Bob');
          done();
        });
    });
    it('handles errors on invalid phone number', done => {
      request
        .post('/api')
        .send({
          query: `mutation {
            createUser(name: "Bob" physicalNumber: "352-1893") {
              id
              name
            }
          }`,
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { errors } = res.body;
          const [error] = errors;
          expect(errors).to.be.instanceof(Array);
          expect(error).to.have.keys('extensions', 'message', 'locations', 'path');
          expect(error.message).to.be.eql('A text for parsing must be a string.');
          done();
        });
    });
  });

  describe('#Queries', () => {
    it('returns a list of users', done => {
      request
        .post('/api')
        .send({ query: '{ getUsers { id name physicalNumber } }' })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getUsers } = res.body.data;
          const [user] = getUsers;
          expect(getUsers).to.be.an.instanceof(Array);
          expect(user).to.have.keys('id', 'name', 'physicalNumber');
          done();
        });
    });
    it('returns a user by phone number lookup', done => {
      request
        .post('/api')
        .send({
          query: `{ getUserByPhysicalPhone(phoneNumber: "3525551893")
          { id name physicalNumber }}`,
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { getUserByPhysicalPhone } = res.body.data;
          expect(getUserByPhysicalPhone).to.have.keys(
            'id',
            'name',
            'physicalNumber',
          );
          done();
        });
    });
    it('returns a user rather than a contact, even if the contact existed first', done => {
      request
        .post('/api')
        .send({
          query: `{ getUserByPhysicalPhone(phoneNumber: "9542584340")
          { id name physicalNumber }}`,
        })
        .set('organization_id', 'lunar')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getUserByPhysicalPhone } = res.body.data;
          expect(getUserByPhysicalPhone).to.have.keys(
            'id',
            'name',
            'physicalNumber',
          );
          expect(getUserByPhysicalPhone.id).to.equal(11);
          done();
        });
    });
  });

  describe('#Mutations', () => {
    it('deletes a user', done => {
      request
        .post('/api')
        .send({
          query: `mutation {
          deleteUser(id: ${newUserId})
        }`,
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { deleteUser } = res.body.data;
          expect(deleteUser).to.eql(true);
          done();
        });
    });
  });
});
