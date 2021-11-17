exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('sources', (table) => {
    table.integer('theme_id').after('archived');
    table.text('form').after('archived');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('sources', (table) => {
    table.dropColumn('theme_id');
    table.dropColumn('form');
  }),
]);
