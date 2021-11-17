exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('groups', (table) => {
      table.uuid('uid').primary();
      table.string('name');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('groups'),
  ]);
};