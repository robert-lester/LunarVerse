exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('event_types', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('event_types'),
  ]);
};