exports.up = function (knex, Promise) {
  return knex.schema.table('sites', (table) => {
    table.dropColumn('api_key');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table('sites', (table) => {
    table.string('api_key');
  });
};