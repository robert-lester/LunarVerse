exports.up = (knex, Promise) => Promise.all([
  knex.schema.table('responses', (table) => {
    table.index(['pod_id'], 'response_by_pod');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.table('responses', (table) => {
    table.dropIndex(['pod_id'], 'response_by_pod');
  }),
]);