exports.up = function (knex, Promise) {
  return knex.schema.table('sites', (table) => {
    table.boolean('is_hipaa');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.table('sites', (table) => {
    table.dropColumn('is_hipaa');
  });
};