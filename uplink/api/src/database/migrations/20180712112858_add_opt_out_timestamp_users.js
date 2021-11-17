exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', table => {
      table.dateTime('opt_out').nullable();
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', table => {
      table.dropColumn('opt_out');
    }),
  ]);
