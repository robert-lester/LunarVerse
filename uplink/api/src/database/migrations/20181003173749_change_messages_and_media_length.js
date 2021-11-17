
exports.up = function(knex, Promise) {
    Promise.all([
        knex.schema.alterTable('messages', (table) => {
          table.text('media','longtext').alter();
          table.string('message', 2000).alter();
        }),
      ]);
};

exports.down = function(knex, Promise) {
  
};
