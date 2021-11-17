
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.json('sender');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.dropColumn('sender');
    }),
  ]);
};
