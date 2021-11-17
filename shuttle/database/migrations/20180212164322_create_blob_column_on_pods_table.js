exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('pods', (table) => {
    table.binary('encrypted').after('data');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('pods', (table) => {
    table.dropColumn('encrypted');
  }),
]);
