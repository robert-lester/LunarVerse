exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', table => {
      table.unique(['organization_id', 'physicalNumber']);
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', table => {
      table.dropUnique(['organization_id', 'physicalNumber']);
    }),
  ]);
