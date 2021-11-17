exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('destination_sources', (table) => {
      table.integer('destination_id');
      table.integer('source_id');
      table.boolean('active');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('destination_sources'),
  ]);
};
