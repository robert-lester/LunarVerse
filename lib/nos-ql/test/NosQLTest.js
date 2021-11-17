const assert = require('chai').assert;
const NosQL = require('../NosQL');

const db = new NosQL();
db.setTable('DynamoTestTable', 'id');

describe('NosQL', () => {
  describe('#create', () => {
    it('should create an object in AWS with id "1"', (done) => {
      db.setTable('DynamoTestTable', 'id');
      db.create('1',{}).then((output) => {
        assert(output.id === '1', `Creation output is not as expected: ${output}`);
        done();
      }).catch((e) => {
        assert(0 === 1, `Creation threw an ${e.name} error`);
        done();
      });
    });

    it('should not error if you create something with the same id', (done) => {
      db.setTable('DynamoTestTable', 'id');
      db.create('1',{}).then((output) => {
        assert(output.id === '1', `Creation output is not as expected: ${output}`);
        done();
      }).catch((e) => {
        assert(e.name === 'ConditionalCheckFailedException', 'Create just replaced the input, this shouldn\'t happen');
        done();
      });
    });

    it('should throw an error if you don\'t have a table set', (done) => {
      db.setTable(null, null);
      try {
        db.create('1',{}).then((output) => {
          assert(0 === 1, `Creation didn't throw a "NullTableException" error when it was excepted`);
          done();
        })
      } catch (e) {
        assert(e.name === 'NullTableException', 'Expecting a NullTableException to be thrown...but it wasn\'t...');
        done();
      }
    });
  });

  describe('#index', () => {
    it('should read the previously made object', (done) => {
      db.setTable('DynamoTestTable', 'id');
      db.index().then((output) => {
        assert(output.length === 1, 'There are extra things in the output! Clean up the test table!');
        assert(output[0].id === '1', `Index output is not as expected: ${output}`);
        done();
      }).catch((e) => {
        assert(0 === 1, `Index threw an ${e.name} error`);
        done();
      });
    });

    it('should throw an error if you don\'t have a table set', (done) => {
      db.setTable(null, null);
      try {
        db.create('1',{}).then((output) => {
          assert(0 === 1, `Index didn't throw a "NullTableException" error when it was excepted`);
          done();
        })
      } catch (e) {
        assert(e.name === 'NullTableException', 'Expecting a NullTableException to be thrown...but it wasn\'t...');
        done();
      }
    });
  });

  describe('#read', () => {
    it('should read the previously made object (only 1)', (done) => {
      db.setTable('DynamoTestTable', 'id');
      db.read('1').then((output) => {
        assert(output.id === '1', `Creation output is not as expected: ${output}`);
        done();
      }).catch((e) => {
        assert(0 === 1, `Read all threw an ${e.name} error`);
        done();
      });
    });

    it('should throw an error if you don\'t have a table set', (done) => {
      db.setTable(null, null);
      try {
        db.create('1',{}).then((output) => {
          assert(0 === 1, `Read didn't throw a "NullTableException" error when it was excepted`);
          done();
        })
      } catch (e) {
        assert(e.name === 'NullTableException', 'Expecting a NullTableException to be thrown...but it wasn\'t...');
        done();
      }
    });
  });

  describe('#update', () => {
    it('should update the existing object', (done) => {
      db.setTable('DynamoTestTable', 'id');
      db.update('1', { unit: 'test' }).then((output) => {
        assert(output.id === '1', `Update output is not as expected: ${output}`);
        assert(output.unit === 'test', `Update output is not as expected: ${output}`);
        done();
      }).catch((e) => {
        assert(0 === 1, `Update threw an ${e.name} error`);
        done();
      });
    });

    it('should throw an error if you don\'t have a table set', (done) => {
      db.setTable(null, null);
      try {
        db.create('1',{}).then((output) => {
          assert(0 === 1, `Update didn't throw a "NullTableException" error when it was excepted`);
          done();
        })
      } catch (e) {
        assert(e.name === 'NullTableException', 'Expecting a NullTableException to be thrown...but it wasn\'t...');
        done();
      }
    });
  });

  describe('#delete', () => {
    it('should delete the existing object', (done) => {
      db.setTable('DynamoTestTable', 'id');
      db.delete('1').then((output) => {
        assert(JSON.stringify(output) === '{}', 'An empty object wasn\'t returned on delete. Error with Delete');
        done();
      }).catch((e) => {
        assert(0 === 1, `Delete threw an ${e.name} error`);
        done();
      });
    });

    it('should throw an error if you don\'t have a table set', (done) => {
      db.setTable(null, null);
      try {
        db.create('1',{}).then((output) => {
          assert(0 === 1, `Delete didn't throw a "NullTableException" error when it was excepted`);
          done();
        })
      } catch (e) {
        assert(e.name === 'NullTableException', 'Expecting a NullTableException to be thrown...but it wasn\'t...');
        done();
      }
    });
  });

  describe('#batchWrite', () => {
    it('should write multiple items', (done) => {
      db.setTable('DynamoTestTable', 'id');
      db.batchWrite([
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ]).then(() => {
        db.index().then((output) => {
          assert(output.length === 3, 'All batches not inserted correctly...');
          done();
        }).catch((e) => {
          assert(0 === 1, `Batch Write threw an ${e.name} error`);
          done();
        });
      });
    });
  });

  describe('#batchRead', () => {
    it('should read multiple items', (done) => {
      db.batchRead(['1', '2']).then((output) => {
        assert(output.length === 2, `Didn't read output correctly...`);
        done();
      }).catch((e) => {
        assert(0 === 1, `Batch Read threw an ${e.name} error`);
        done();
      });
    });
  });

  describe('#cleanup', () => {
    it('should clean up the database (not a test)', (done) => {
      const a = db.delete('1');
      const b = db.delete('2');
      const c = db.delete('3');
      Promise.all([a, b, c]).then(() => { done(); });
    });
  });
});