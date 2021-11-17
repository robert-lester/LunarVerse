exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.createTableIfNotExists('conversations', table => {
      table.increments('id');
      table.string('organization_id');
      table.timestamps();
    }),
  ]);

exports.down = (knex, Promise) => Promise.all([knex.schema.dropTableIfExists('conversations')]);
