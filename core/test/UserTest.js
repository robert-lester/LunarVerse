const assert = require('chai').assert;

const API = require('../core');
const { AuthorizationController } = require('../auth');
const { generateIamPolicy } = require('../utils');
const { UserAuthorizerFactory } = require('../../lib/capsule/capsule');

// Controller dependencies
const authFactory = new UserAuthorizerFactory();
const authController = new AuthorizationController();

describe('User', () => {
  describe('#constructor', () => {
    it('should successfully create a new user controller', () => {
      const user = new API.UserController(authController);
    });

    it('should throw an error if you don\'t pass an auth controller', (done) => {
      try {
        const user = new API.UserController();
        assert(0 === 1, 'A non-Array param should throw an error in the constructor')
      } catch(e) {
        done();
      }
    });
  });

  describe('#index', () => {
    it('should need to login to view data', (done) => {
      const user = new API.UserController(authController);
      user.index().then((data) => {
        assert(0 === 1, 'Data viewable without logging in');
      }).catch((err) => {
        console.error(err);
        done();
      });
    });
  });
});