exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('pods', (table) => {
    table.index(['source_id', 'updated_at']);
    table.index(['organization_id', 'source_id', 'updated_at']);
    table.index('created_at');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('pods', (table) => {
    table.dropIndex(['source_id', 'updated_at']);
    table.dropIndex(['organization_id', 'source_id', 'updated_at']);
    table.dropIndex('created_at');
  }),
]);
