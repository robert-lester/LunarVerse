const assert = require('chai').assert;
const Scaffold = require('../src/Scaffold');

describe('Scaffold', () => {
  describe('#constructor', () => {
    it('should throw an error if you try and declare a Scaffold by itself', (done) => {
      try {
        const scaffold = new Scaffold();
        assert(0 === 1, 'You should not be able to make an instance of Scaffold...');
      } catch (e) {
        done();
      }
    });
  });
});