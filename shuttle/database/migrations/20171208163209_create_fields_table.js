exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('fields', (table) => {
      table.increments('id');
      table.string('name');
      table.string('organization_id');
      table.boolean('archived');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('fields'),
  ]);
};
