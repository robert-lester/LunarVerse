const Joi = require('joi');
const assert = require('chai').assert;
const Controller = require('../src/Controller');

describe('Controller', () => {
  describe('#constructor', () => {
    it('should create protected un-usable functions', () => {
      const controller = new Controller(['myFunction']);
      assert(controller.ignoredMethods.includes('myFunction'), 'Didn\'t create a protected function');
    });

    it('should throw an error if you try and pass a non-array', (done) => {
      try {
        const controller = new Controller('');
        assert(0 === 1, 'A non-Array param should throw an error in the constructor')
      } catch(e) {
        done();
      }
    });
  });

  describe('#handler', () => {
    it('should validate the schema and fail if you pass the wrong type', (done) => {
      const controller = new Controller();
      controller.schema = {
        myFunction: {
          param: Joi.string(),
        },
      };

      controller.myFunction = (param) => param;
      controller.myFunction2 = (param) => param + 5;

      try {
        controller.myFunction('0');
      } catch (e) {
        assert(0 === 1, `Controller.handler() isn't validating good schema properly and throwing an ${e.name} error`);
      }

      try {
        controller.myFunction(0);
        assert(0 === 1, `Controller.handler() isn't validating bad schema properly and not throwing an error`);
      } catch(e) {}

      try {
        controller.myFunction2();
        assert(0 === 1, `Controller.handler() isn't validating no schema properly`);
      } catch(e) {}

      done();
    });
  });
});