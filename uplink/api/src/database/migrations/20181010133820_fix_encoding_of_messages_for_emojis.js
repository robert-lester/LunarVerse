
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.string('message', 2000).collate('utf8mb4_general_ci').alter();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.string('message', 2000).collate('').alter();
    }),
  ]);
};
