exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('invites', table => {
      table.unique('organization_id');
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.table('invites', table => {
      table.dropUnique('organization_id');
    }),
  ]);
