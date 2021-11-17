exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('sites', (table) => {
      table.uuid('uid').primary();
      table.string('name');
      table.string('domain');
      table.string('slug');
      table.string('api_key');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('sites'),
  ]);
};