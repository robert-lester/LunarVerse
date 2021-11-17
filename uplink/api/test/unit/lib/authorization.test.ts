import { expect } from 'chai';
import { User } from '../../../src/models';
import {
  isAuthedResolver,
  canView,
  readPermissions
} from '../../../src/lib/authorization';

describe('lib/authorization', () => {
  describe('isAuthedResolver', () => {
    const ctx = {
      Context: {
        headers: {
          authorization: '1234',
        },
        state: {},
      },
    };
    it('throws error due to authorization token', async () => {
      const authResolver = isAuthedResolver(params => params);

      try {
        await authResolver({}, '', ctx as any, '');
      } catch (err) {
        expect(err.constructor.name).to.equal('AuthenticationException');
      }
    });
    it('resolves with proper authorization token format', async () => {
      const authResolver = isAuthedResolver(params => params);
      ctx.Context.headers.authorization = 'Basic 1234';
      const resolve = await authResolver({}, '', ctx as any, '');
      expect(resolve).to.be.an('object');
    });
  });
  describe('canView', () => {
    it('returns the record if it has the same organization id as is passed into the function', done => {
      const user = new User();
      const org = 'org1';
      user.organization_id = org;
      const test = canView(org, user);
      expect(test).to.equal(user);
      done();
    });
    it('returns null if the record does not have the same organization id as is passed into the function', done => {
      const user = new User();
      const org = 'org1';
      const otherOrg = 'org2';
      user.organization_id = org;
      const test = canView(otherOrg, user);
      expect(test).to.equal(null);
      done();
    });
  });
  describe('readPermissions', () => {
    it('filters out records that do not match the organization', done => {
      const org1 = 'org1';
      const org2 = 'org2';
      const obj = [{
        organization_id: org1,
      }];
      const test = readPermissions(org2, obj);
      expect(test).to.be.an('array').that.is.empty;
      done();
    });
    it('returns the records that match the organization', done => {
      const org1 = 'org1';
      const org2 = 'org2';
      const orgObj = [{
        organization_id: org2,
      }];
      const testObj = orgObj.concat([{
        organization_id: org1,
      }]);
      const test = readPermissions(org2, testObj);
      expect(test).to.eql(orgObj);
      done();
    });
  });
});
