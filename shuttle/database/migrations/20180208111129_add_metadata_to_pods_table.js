
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('pods', (table) => {
      table.json('metadata').after('data');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('pods', (table) => {
      table.dropColumn('metadata');
    }),
  ]);
};
