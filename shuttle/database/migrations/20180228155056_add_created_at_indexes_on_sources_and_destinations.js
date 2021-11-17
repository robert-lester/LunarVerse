exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('sources', (table) => {
    table.index('created_at');
  }),
  knex.schema.table('destinations', (table) => {
    table.index('created_at');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('sources', (table) => {
    table.dropIndex('created_at');
  }),
  knex.schema.table('destinations', (table) => {
    table.dropIndex('created_at');
  }),
]);
