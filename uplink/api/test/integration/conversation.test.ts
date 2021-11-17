/**
 * Tests for Conversation type
 */

import * as supertest from 'supertest';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { execSqlScript } from './setup.test';

const request = supertest('http://localhost:3001');

describe('Conversation Type', function () {
  before(async function() {
      await execSqlScript('./init/uplink_db_init.sql');
  });

  describe('#Queries', () => {
    it('returns a single conversation', done => {
      request
        .post('/api')
        .send({
          query: `{ getConversation(id: 5, finalDate: "2018-12-11T16:15:30.000Z") {
              id
              finalDate
              messages {
                type
              }
            }
          }`,
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getConversation } = res.body.data;

          expect(getConversation).to.have.property('id');
          expect(getConversation).to.have.property('messages');

          getConversation.messages.forEach((message) => {
            expect(message.type).to.eql('USER');
          });
          expect(getConversation.id).to.eql(5);
          done();
        });
    });

    const getConversationsQuery = {
      query: `query GetConversations($selectedNumbers: [String], $dateRange: DateRange, $sort: SortOptions) {
        getConversations(phoneNumbers: $selectedNumbers, filter: $dateRange, sort: $sort) {
          id
          updated_at
          phoneNumbers {
            id
            systemNumber
            type
            user {
              id
              name
              physicalNumber
              color
            }
          }
        }
      }`,
      operationName: 'GetConversations',
      variables: null
    };

    it('returns one contact\'s conversation based on date and time range', done => {
      getConversationsQuery.variables = {
        selectedNumbers: [
          '(573)345-2574'
        ],
        dateRange: {
          initial: '2018-12-10T16:12:30.000Z',
          final: '2018-12-11T16:15:30.000Z'
        },
        sort: 'DESC'
      };
      request
        .post('/api')
        .set('Content-type', 'application/json')
        .set('organization_id', 'data-accuracy-qa')
        .send(getConversationsQuery)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getConversations } = res.body.data;
          expect(getConversations).to.be.an('array').of.length(1);

          const [ conversation ] = getConversations;
          expect(conversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(conversation.phoneNumbers).to.be.an('array').of.length(2);

          const [ user, contact ] = conversation.phoneNumbers;
          expect(user).to.have.all.keys('id', 'systemNumber', 'type', 'user');
          expect(user.user).to.include.keys('id', 'name', 'physicalNumber');
          expect(contact).to.have.all.keys('id', 'systemNumber', 'type', 'user');
          expect(contact.user).to.include.keys('id', 'name', 'physicalNumber');
          expect(user.user.physicalNumber).to.be.an('string').that.equals('(904) 543-1234');
          expect(contact.user.physicalNumber).to.be.an('string').that.equals('(407) 949-4246');
          done();
        });
    });

    it('returns user and contact conversations based on date and time range', done => {
      getConversationsQuery.variables = {
        selectedNumbers: [
          '4704504769',
          '(573)345-2574'
        ],
        dateRange: {
          initial: '2018-11-10T16:13:30.000Z',
          final: '2018-12-11T16:15:30.000Z'
        },
        sort: 'DESC'
      };
      request
        .post('/api')
        .set('Content-type', 'application/json')
        .set('organization_id', 'data-accuracy-qa')
        .send(getConversationsQuery)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getConversations } = res.body.data;
          expect(getConversations).to.be.an('array').of.length(2);

          const [ userConversation, contactConversation ] = getConversations;
          expect(userConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(userConversation.phoneNumbers).to.be.an('array').of.length(2);

          let [ user, contact ] = userConversation.phoneNumbers;
          expect(user).to.have.all.keys('id', 'systemNumber', 'type', 'user');
          expect(user.user).to.include.keys('id', 'name', 'physicalNumber');
          expect(contact).to.have.all.keys('id', 'systemNumber', 'type', 'user');
          expect(contact.user).to.include.keys('id', 'name', 'physicalNumber');
          expect(user.user.physicalNumber).to.be.an('string').that.equals('(904) 543-1234');
          expect(contact.user.physicalNumber).to.be.an('string').that.equals('(407) 949-4246');

          expect(contactConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(contactConversation.phoneNumbers).to.be.an('array').of.length(2);

          [ user, contact ] = contactConversation.phoneNumbers;
          expect(user).to.have.all.keys('id', 'systemNumber', 'type', 'user');
          expect(user.user).to.include.keys('id', 'name', 'physicalNumber');
          expect(contact).to.have.all.keys('id', 'systemNumber', 'type', 'user');
          expect(contact.user).to.include.keys('id', 'name', 'physicalNumber');
          expect(user.user.physicalNumber).to.be.an('string').that.equals('(904) 654-1235');
          expect(contact.user.physicalNumber).to.be.an('string').that.equals('(321) 507-7468');

          done();
        });
    });

    it('returns a conversation for a user in the lunar org and no date range', done => {
      getConversationsQuery.variables = {
        selectedNumbers: [
          '+14255494865'
        ],
        sort: 'DESC'
      };
      request
        .post('/api')
        .set('Content-type', 'application/json')
        .set('organization_id', 'lunar')
        .send(getConversationsQuery)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getConversations } = res.body.data;
          expect(getConversations).to.be.an('array').of.length(1);
          done();
        });
    });

    it('returns no conversations for a user not in the requested org data-accuracy-qa org', done => {
      getConversationsQuery.variables = {
        selectedNumbers: [
          '+14255494865'
        ],
        sort: 'DESC'
      };
      request
        .post('/api')
        .set('Content-type', 'application/json')
        .set('organization_id', 'data-accuracy-qa')
        .send(getConversationsQuery)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getConversations } = res.body.data;
          expect(getConversations).to.be.an('array').of.length(0);
          done();
        });
    });

    it('returns several conversations between particular dates', done => {
      getConversationsQuery.variables = {
        dateRange: {
          initial: '2018-12-10T16:12:30.000Z',
          final: '2018-12-12T00:00:00.000Z'
        },
        sort: 'DESC'
      };
      request
        .post('/api')
        .set('Content-type', 'application/json')
        .set('organization_id', 'data-accuracy-qa')
        .send(getConversationsQuery)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getConversations } = res.body.data;
          expect(getConversations).to.be.an('array').of.length(2);
          const [ firstConversation, secondConversation ] = getConversations;
          expect(firstConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(firstConversation.updated_at).to.be.an('string').that.equals('Mon, 07 Jan 2019 16:18:57 GMT');
          expect(secondConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(secondConversation.updated_at).to.be.an('string').that.equals('Mon, 07 Jan 2019 16:18:26 GMT');
          done();
        });
    });

    it('returns several conversations between particular dates in ascending order', done => {
      getConversationsQuery.variables = {
        dateRange: {
          initial: '2018-12-10T16:12:30.000Z',
          final: '2018-12-12T00:00:00.000Z'
        },
        sort: 'ASC'
      };
      request
        .post('/api')
        .set('Content-type', 'application/json')
        .set('organization_id', 'data-accuracy-qa')
        .send(getConversationsQuery)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getConversations } = res.body.data;
          expect(getConversations).to.be.an('array').of.length(2);
          const [ firstConversation, secondConversation ] = getConversations;
          expect(secondConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(secondConversation.updated_at).to.be.an('string').that.equals('Mon, 07 Jan 2019 16:18:57 GMT');
          expect(firstConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(firstConversation.updated_at).to.be.an('string').that.equals('Mon, 07 Jan 2019 16:18:26 GMT');
          done();
        });
    });

    it('returns several conversations when the final date is earlier than the initial date', done => {
      getConversationsQuery.variables = {
        dateRange: {
          initial: '2018-12-10T16:12:30.000Z',
          final: '-5'
        },
        sort: 'DESC'
      };
      request
        .post('/api')
        .set('Content-type', 'application/json')
        .set('organization_id', 'data-accuracy-qa')
        .send(getConversationsQuery)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const { getConversations } = res.body.data;
          expect(getConversations).to.be.an('array').of.length(4);
          const [ firstConversation, secondConversation, thirdConversation ] = getConversations;
          expect(firstConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(firstConversation.updated_at).to.be.an('string').that.equals('Mon, 07 Jan 2019 16:18:57 GMT');
          expect(secondConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(secondConversation.updated_at).to.be.an('string').that.equals('Mon, 07 Jan 2019 16:18:26 GMT');
          expect(thirdConversation).to.have.all.keys('id', 'updated_at', 'phoneNumbers');
          expect(thirdConversation.updated_at).to.be.an('string').that.equals('Mon, 07 Jan 2019 16:16:52 GMT');
          done();
        });
    });
  });
});
