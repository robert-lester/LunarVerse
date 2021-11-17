import * as supertest from 'supertest';
import { expect } from 'chai';
import { resetDb } from '../setup.test';
const request = supertest('http://localhost:3001');

describe('A query to the /api mutation graphql endpoint "sendMessageFromWebApp"', () => {
  // Create a pristine copy of the database for this test suite
  before(async () => {
    await resetDb();
  });

  // Leave a pristine copy of the database for the next test suite to use
  after(async () => {
    await resetDb();
  });

  describe('that passes a user number that is not from US or Canada for the "From" attribute', () => {
    describe('or passes a contact number that is not from US or Canada in the "To" field', () => {
      // TODO: Determine why this is returning INCORRECT_PHONE_NUMBER_FORMAT instead of INVALID_INTERNATIONAL_NUMBER
      /**
       * Initialize described scenario
       */

      // Block scoped global response to capture the response from the before block so that multiple 'it' statements can assert on it
      let response;

      const query = `
      mutation {
        sendMessageFromWebApp(fields: {
            To: "+861065529988",
            From: "+861065529989",
            Body: "User or Contact number is not from US or Canada"
        }) {
          To,
          From,
          Body,
          NumMedia
        }
     }
     `;

      // Block scoped global expected object to capture what we expect to return from the database for assertions
      const expected = {
        data: {
            sendMessageFromWebApp: null
        },
        errors: [
            {
                message: 'Incorrect phone number format',
                extensions: {
                    code: 'INCORRECT_PHONE_NUMBER_FORMAT'
                },
                locations: [
                    {
                        line: 3,
                        column: 9
                    }
                ],
                path: [
                    'sendMessageFromWebApp'
                ]
            }
        ]
    };
      // Perform the query once so that it can be acted on simply by multiple "it" statements
      before(done => {
        request
          .post('/api')
          .send({
            query,
          })
          .set('organization_id', 'data-accuracy-qa')
          .expect(200)
          .then(res => {
            // Set block scoped global `response` for assertions by 'it' statements
            response = res.body;
            done();
          })
          .catch(err => {
            done(err);
          });
      });

      it('should inform the user that they have an incorrect phone format.', () => {
        expect(response).to.deep.eq(expected);
      });
    });
  });
  describe('that passes a user number that is from US or Canada for a user that is in our system for the "From" attribute', () => {
    describe('and passes a contact number that is from US or Canada for a user that is in our system for the "To" attribute', () => {
      /**
       * Initialize described scenario
       */

      // Block scoped global response to capture the response from the before block so that multiple 'it' statements can assert on it
      let response;

      const query = `
      mutation {
        sendMessageFromWebApp(fields: {
            To: "4704504769",
            From: "4076661234",
            Body: "Happy Path - Good User and Contact"
        }) {
          To,
          From,
          Body,
          NumMedia
        }
     }
     `;

      // Block scoped global expected object to capture what we expect to return from the database for assertions
      const expected = {
        data: {
          sendMessageFromWebApp: {
              To: '4704504769',
              From: '4076661234',
              Body: 'Happy Path - Good User and Contact',
              NumMedia: 0
          }
        }
      };
      // Perform the query once so that it can be acted on simply by multiple "it" statements
      before(done => {
        request
          .post('/api')
          .send({
            query,
          })
          .set('organization_id', 'data-accuracy-qa')
          .expect(200)
          .then(res => {
            // Set block scoped global `response` for assertions by 'it' statements
            response = res.body;
            done();
          })
          .catch(err => {
            done(err);
          });
      });

      it('should return the fields passed into it to signify that it was successful.', () => {
        expect(response).to.deep.eq(expected);
      });
    });
  });
  describe('that passes a user number that is not in our system for the "to" attribute', () => {
      /**
       * Initialize described scenario
       */

      // Block scoped global response to capture the response from the before block so that multiple 'it' statements can assert on it
      let response;

      const query = `
      mutation {
        sendMessageFromWebApp(fields: {
            To: "4704509999",
            From: "4076665555",
            Body: "User not in system"
        }) {
          To,
          From,
          Body,
          NumMedia
        }
     }
     `;

      // Block scoped global expected object to capture what we expect to return from the database for assertions
      const expected = {
        data: {
          sendMessageFromWebApp: null,
        },
        errors: [
          {
            message: 'Cannot find user with that number',
            extensions: {
              code: 'CANNOT_FIND_USER',
            },
            locations: [
              {
                line: 3,
                column: 9,
              },
            ],
            path: ['sendMessageFromWebApp'],
          },
        ],
      };
      // Perform the query once so that it can be acted on simply by multiple "it" statements
      before(done => {
        request
          .post('/api')
          .send({
            query,
          })
          .set('organization_id', 'data-accuracy-qa')
          .expect(200)
          .then(res => {
            // Set block scoped global `response` for assertions by 'it' statements
            response = res.body;
            done();
          })
          .catch(err => {
            done(err);
          });
      });

      it('should inform the consumer that the user could not be found', () => {
        expect(response).to.deep.eq(expected);
      });
  });
});
