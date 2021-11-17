import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createLocalServerRequestInstance } from '../utils/request';
import { ClientErrors } from '../../../../lib/api-errors/ErrorCodes';
import { resetDb } from '../setup.test';

const server1 = createLocalServerRequestInstance(3001);

describe('controllers/users', () => {
  before(async () => {
     await resetDb();
  });
  after(async () => {
    await resetDb();
  });
  describe('createContact', () => {
    // TODO: Add a User system number to "lunar" so we can run the next test

    // it('creates a new Contact when the passed contactRealNumber does not relate to a Contact in the passed userRealNumber\'s org and returns a system number from the pool', async () => {
    //   const response = await server1(`mutation {
    //     createContact(userRealNumber: "+19046541235", contactRealNumber: "+14079998822") {
    //       id
    //       systemNumber
    //     }
    //   }`, 'lunar');
    //   expect(response.data.createContact.id).to.equal(31);
    //   expect(response.data.createContact.systemNumber).to.equal('(551) 231-1227');
    // });

    it('recycles a new Contact when the passed contactRealNumber does not relate to a Contact in the passed userRealNumber\'s org and the pool is full', async () => {
      const response = await server1(`mutation {
        createContact(userRealNumber: "+19046541235", contactRealNumber: "+14079998822") {
          id
          systemNumber
        }
      }`);
      expect(response.data.createContact.id).to.equal(26);
      expect(response.data.createContact.systemNumber).to.equal('(551) 231-1227');
    });

    it('returns an existing Contact system number when the passed contactRealNumber relates to a Contact in the passed userRealNumber\'s org', async () => {
      const response = await server1(`mutation {
        createContact(userRealNumber: "+19046541235", contactRealNumber: "+13215077468") {
          id
          systemNumber
        }
      }`);
      expect(response.data.createContact.id).to.equal(29);
      expect(response.data.createContact.systemNumber).to.equal('(616) 201-3756');
    });

    it('throws an Error if the passed userRealNumber does not belong to a real User', async () => {
      const response = await server1(`mutation {
        createContact(userRealNumber: "+14704504769", contactRealNumber: "+13215077468") {
          id
          systemNumber
        }
      }`);
      expect(response.errors[0].message).to.equal(ClientErrors.CANNOT_CREATE_CONTACT_WITHOUT_USER_NUMBER);
    });

    it('returns only Users through the getUsers query, not Contacts', async () => {
      const response = await server1(`query {
        getUsers(assigned: true) {
          name
          id
          physicalNumber
          color
        }
      }`);
      expect(response.data.getUsers.map(user => user.id)).to.not.contain(5);
    });

    it('assigns Contact system numbers sequentially even when called in parallel', async () => {
      const systemNumbers = [];

      await Promise.all(['+14079998823', '+14079998824', '+14079998825'].map(async (contactRealNumber, idx) => {
        const server = createLocalServerRequestInstance(3001 + idx);
        const response = await server(`mutation {
          createContact(userRealNumber: "+19046541235", contactRealNumber: "${contactRealNumber}") {
            id
            systemNumber
          }
        }`);
        systemNumbers.push(response.data.createContact.systemNumber);
      }));
      expect(systemNumbers).to.have.ordered.members(['(616) 201-3756', '(707) 610-1972', '(814) 200-1719']);
    });
  });
});