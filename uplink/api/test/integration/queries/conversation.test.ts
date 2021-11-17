import * as supertest from 'supertest';
import { expect } from 'chai';
import { describe, it } from 'mocha';

const request = supertest('http://localhost:3001');

describe('queries/rootConversation', () => {
  describe('Get Conversation', () => {
    const getConversationQuery = `query getConversation($id: Int, $finalDate: String, $attributes: ConversationAttributes) {
      getConversation(id: $id, finalDate: $finalDate, attributes: $attributes) {
        id,
        finalDate,
        messageCount,
        offset,
        messages {
          message
          created_at
          updated_at
        }
      }
    }
    `;
    it('Returns a conversation with 5 messages', done => {
      request
        .post('/api')
        .send({
          query: getConversationQuery,
        variables: {
          id: 4,
          finalDate: '2018-12-04T23:59:59.808Z',
          attributes: {
            messageCount: 5
          }
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text).data;

          expect(apiResponse.getConversation.id).to.eql(4);
          expect(apiResponse.getConversation.messages.length).to.eql(5);

          done();
        });
    });
    it('Returns a conversation with 2 messages and a positive offset', done => {
      request
        .post('/api')
        .send({
          query: getConversationQuery,
        variables: {
          id: 4,
          finalDate: '2018-12-04T23:59:59.808Z',
          attributes: {
            messageCount: 2,
            offset: 2
          }
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text).data;

          expect(apiResponse.getConversation.id).to.eql(4);
          expect(apiResponse.getConversation.messages.length).to.eql(2);

          done();
        });
    });
    it('Returns a conversation with 0 messages', done => {
      request
        .post('/api')
        .send({
          query: getConversationQuery,
        variables: {
          id: 1,
          finalDate: '2018-08-03T23:59:59.808Z',
          attributes: {
            messageCount: 5
          }
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text).data;

          expect(apiResponse.getConversation.id).to.eql(1);
          expect(apiResponse.getConversation.messages.length).to.eql(0);

          done();
        });
    });
    it('Returns a conversation with 1 messages and a specific date', done => {
      request
        .post('/api')
        .send({
          query: getConversationQuery,
        variables: {
          id: 2,
          finalDate: '2018-11-10T23:59:59.808Z',
          attributes: {
            messageCount: 1,
            offset: 0
          }
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text).data;

          expect(apiResponse.getConversation.id).to.eql(2);
          expect(apiResponse.getConversation.messages.length).to.eql(1);
          expect(apiResponse.getConversation.messages[0].created_at).to.eql('Sun, 04 Nov 2018 16:14:34 GMT');

          done();
        });
    });
    it('Returns a conversation with 1 message', done => {
      request
        .post('/api')
        .send({
          query: getConversationQuery,
        variables: {
          id: 2,
          finalDate: '2018-11-10T23:59:59.808Z',
          attributes: {
            messageCount: 1,
            offset: -1
          }
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text).data;

          expect(apiResponse.getConversation.id).to.eql(2);
          expect(apiResponse.getConversation.messages.length).to.eql(1);
          expect(apiResponse.getConversation.messages[0].created_at).to.eql('Mon, 10 Dec 2018 16:14:36 GMT');

          done();
        });
    });
    it('Returns a conversation with a phone call that was updated (finalDate) the day after the created date', done => {
      request
        .post('/api')
        .send({
          query: getConversationQuery,
        variables: {
          id: 2,
          finalDate: '2018-12-22T23:59:59.808Z',
          attributes: {
            messageCount: 1,
            offset: 0
          }
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text).data;

          expect(apiResponse.getConversation.id).to.eql(2);
          expect(apiResponse.getConversation.messages.length).to.eql(1);
          expect(apiResponse.getConversation.messages[0].created_at).to.eql('Fri, 21 Dec 2018 16:13:29 GMT');
          expect(apiResponse.getConversation.messages[0].updated_at).to.eql('Sat, 22 Dec 2018 05:13:29 GMT');

          done();
        });
    });
    it('Returns a conversation with correct offset and correct order', done => {
      request
        .post('/api')
        .send({
          query: getConversationQuery,
        variables: {
          id: 2,
          finalDate: '2018-11-10T23:59:59.808Z',
          attributes: {
            messageCount: 2,
            offset: -1
          }
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text).data;

          expect(apiResponse.getConversation.id).to.eql(2);
          expect(apiResponse.getConversation.messages.length).to.eql(2);
          expect(apiResponse.getConversation.messages[0].created_at).to.eql('Mon, 10 Dec 2018 16:14:36 GMT');
          expect(apiResponse.getConversation.messages[1].created_at).to.eql('Fri, 21 Dec 2018 16:13:29 GMT');

          done();
        });
    });
    it('Throws a invalid date error', done => {
      request
        .post('/api')
        .send({
          query: getConversationQuery,
        variables: {
          id: 2,
          finalDate: '2018-11-10',
          attributes: {
            messageCount: 2,
            offset: -1
          }
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          const apiResponse = JSON.parse(res.text);

          expect(apiResponse.data.getConversation).to.eql(null);
          expect(apiResponse.errors[0].message).to.eql('Invalid Date');

          done();
        });
    });
  });
});
