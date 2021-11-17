
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.renameColumn('sender', 'user');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.renameColumn('user', 'sender');
    }),
  ]);
};
