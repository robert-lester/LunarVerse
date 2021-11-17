
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.string('message').alter();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.binary('message').alter();
    })
  ]);
};
