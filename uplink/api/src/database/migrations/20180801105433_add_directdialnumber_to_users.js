exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', (table) => {
      table.string('directDialNumber').nullable();
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', (table) => {
      table.dropColumn('directDialNumber');
    }),
  ]);
