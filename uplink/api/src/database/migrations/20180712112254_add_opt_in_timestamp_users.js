exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', table => {
      table.dateTime('opt_in').nullable();
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', table => {
      table.dropColumn('opt_in');
    }),
  ]);
