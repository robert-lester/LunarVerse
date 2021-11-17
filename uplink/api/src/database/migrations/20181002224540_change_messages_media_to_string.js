
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.string('media').alter();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.binary('media').alter();
    }),
  ]);
};
