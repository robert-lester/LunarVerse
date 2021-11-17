exports.up = function(knex, Promise) {
  return knex.schema.table('sites', (table) => {
    table.json('amp_base_config');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('sites', (table) => {
    table.dropColumn('amp_base_config');
  });
};