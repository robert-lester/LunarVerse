import * as supertest from 'supertest';
import { expect } from 'chai';
import { describe, it } from 'mocha';

const request = supertest('http://localhost:3001');
// console.log(request);
describe('queries/rootUsage', () => {
  describe('Get Usage', () => {
    const usageQuery = `query GetUsage($dateRange: DateRange, $phoneNumbers: [String]) {
      getUsage(dateRange: $dateRange, phoneNumbers: $phoneNumbers) {
        usage {
          message {
            inBound {
              count
              date
            }
            outBound {
              count
              date
            }
            inBoundSMS {
              count
              date
            }
            inBoundMediaMessages {
              count
              date
            }
            outBoundSMS {
              count
              date
            }
            outBoundMediaMessages {
              count
              date
            }
          }
          voice {
            inBound {
              count
              date
            }
            outBound {
              count
              date
            }
          }
        }
        usageByPhone {
          systemNumber
          message {
            inBound {
              count
              date
            }
            outBound {
              count
              date
            }
            inBoundSMS {
              count
              date
            }
            inBoundMediaMessages {
              count
              date
            }
            outBoundSMS {
              count
              date
            }
            outBoundMediaMessages {
              count
              date
            }
          }
          voice {
            inBound {
              count
              date
            }
            outBound {
              count
              date
            }
          }
        }
        totals {
          message {
            inBound {
              count
            }
            outBound {
              count
            }
            inBoundSMS {
              count
            }
            outBoundSMS {
              count
            }
            inBoundMediaMessages {
              count
            }
            outBoundMediaMessages {
              count
            }
          }
          voice {
            inBound {
              count
            }
            outBound {
              count
            }
          }
        }
      }
    }`;

    const allUsersTotalInbound = 6;
    const allUsersTotalOutbound = 7;
    const allUsersTotalInboundVoice = 22;
    const allUsersTotalOutboundVoice = 22;

    const allInbound = [
      { count: 0 },
      { count: 0 },
      { count: 3 },
      { count: 2 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 1 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 }
    ];

    it('returns succesful usage data for ALL users', done => {
      const dateRange = {
        initial: '2018-11-01T04:00:00.000Z',
        final: '2018-12-01T03:59:59.999Z'
      };

      request
        .post('/api')
        .send({
          query: usageQuery,
        variables: {
          dateRange,
          phoneNumbers: [],
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const apiResponse = JSON.parse(res.text).data;
          const total = apiResponse.getUsage.totals;
          expect(apiResponse).to.haveOwnProperty('getUsage');
          expect(total).to.haveOwnProperty('message');
          expect(apiResponse.getUsage.usage).to.haveOwnProperty('message');
          expect(apiResponse.getUsage.usageByPhone).to.be.an('array').that.is.empty;
          expect(total.message.inBound.count).to.equal(allUsersTotalInbound);
          expect(total.message.outBound.count).to.equal(allUsersTotalOutbound);
          expect(total.voice.inBound.count).to.equal(allUsersTotalInboundVoice);
          expect(total.voice.outBound.count).to.equal(allUsersTotalOutboundVoice);

          done();
        });
    });
    it('returns succesful usage data for a specific user', done => {
      const dateRange = {
        initial: '2018-11-01T04:00:00.000Z',
        final: '2018-12-01T03:59:59.999Z'
      };

      request
        .post('/api')
        .send({
          query: usageQuery,
        variables: {
          dateRange,
          phoneNumbers: ['+17542403370'],
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const apiResponse = JSON.parse(res.text).data;
          expect(apiResponse).to.haveOwnProperty('getUsage');
          expect(apiResponse.getUsage.totals).to.haveOwnProperty('message');
          expect(apiResponse.getUsage.usage).to.haveOwnProperty('message');
          expect(apiResponse.getUsage.usageByPhone).to.be.an('array');
          expect(apiResponse.getUsage.usageByPhone[0]).to.have.property('message');
          expect(apiResponse.getUsage.usageByPhone[0]).to.have.property('systemNumber').that.equals('(754) 240-3370');

          done();
        });
    });
    it('returns accurate usage data for specific users', done => {
      const dateRange = {
        initial: '2018-11-01T04:00:00.000Z',
        final: '2018-12-01T03:59:59.999Z'
      };

      request
        .post('/api')
        .send({
          query: usageQuery,
        variables: {
          dateRange,
          phoneNumbers: ['+17542403370', '+16292054180'],
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const apiResponse = JSON.parse(res.text).data;
          const total = apiResponse.getUsage.totals;
          const userOne = apiResponse.getUsage.usageByPhone[0];
          const userTwo = apiResponse.getUsage.usageByPhone[1];

          expect(userOne.systemNumber).to.eql('(754) 240-3370');
          expect(userTwo.systemNumber).to.eql('(629) 205-4180');
          // Show that the total numbers are not the same as All Users
          expect(total.message.inBound.count).to.not.equal(allUsersTotalInbound);
          expect(total.message.outBound.count).to.not.equal(allUsersTotalOutbound);
          expect(total.voice.inBound.count).to.not.equal(allUsersTotalInboundVoice);
          expect(total.voice.outBound.count).to.not.equal(allUsersTotalOutboundVoice);

          expect(total.message.inBound.count).to.equal(5);
          expect(total.message.outBound.count).to.equal(5);
          expect(total.voice.inBound.count).to.equal(20);
          expect(total.voice.outBound.count).to.equal(20);

          done();
        });
    });
    it('builds the correct IUsageDetails format based on the date range', done => {
      const dateRange = {
        initial: '2018-11-01T04:00:00.000Z',
        final: '2018-12-01T03:59:59.999Z'
      };

      request
        .post('/api')
        .send({
          query: usageQuery,
        variables: {
          dateRange,
          phoneNumbers: [],
        },
        })
        .set('organization_id', 'data-accuracy-qa')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const apiResponse = JSON.parse(res.text).data;
          const usageMessage = apiResponse.getUsage.usage.message;
          expect(usageMessage.inBound).to.be.an('array');
          // Compare the counts of the inBound messages
          // TODO: figure out why the dates from CircleCI were not the
          // same as running the tests locally.
          const inBoundCountList = usageMessage.inBound.map(message => ({
            count: message.count,
          }));

          expect(inBoundCountList).to.have.deep.members(allInbound);

          done();
        });
    });
  });
});