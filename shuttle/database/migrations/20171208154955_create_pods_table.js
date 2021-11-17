exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('pods', (table) => {
      table.increments('id');
      table.string('organization_id');
      table.string('source_id');
      table.json('data');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('pods'),
  ]);
};
