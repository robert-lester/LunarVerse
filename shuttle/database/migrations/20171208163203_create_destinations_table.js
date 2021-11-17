exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('destinations', (table) => {
      table.increments('id');
      table.string('name');
      table.string('organization_id');
      table.string('type');
      table.json('config');
      table.json('mapping');
      table.json('validation');
      table.boolean('archived');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('destinations'),
  ]);
};
