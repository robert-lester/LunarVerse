exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('sources', (table) => {
      table.increments('id');
      table.uuid('api_key');
      table.string('name');
      table.string('organization_id');
      table.json('mapping');
      table.json('fields');
      table.json('router');
      table.boolean('archived');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('sources'),
  ]);
};
