exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('pods', (table) => {
    table.binary('enc_ref').after('data');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('pods', (table) => {
    table.dropColumn('enc_ref');
  }),
]);
