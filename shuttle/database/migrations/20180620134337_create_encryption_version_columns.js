exports.up = knex => Promise.all([
  knex.schema.table('destinations', (table) => {
    table.integer('encryption_version').after('config');
  }),
  knex.schema.table('pods', (table) => {
    table.integer('encryption_version').after('encrypted');
  }),
]);

exports.down = () => {
  throw new Error('This migration is not backwards-compatible and must use a backfill script to deprecate');
};
