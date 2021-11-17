exports.up = function(knex, Promise) {
  return knex.schema.alterTable('sites', (table) => {
    table.unique('domain');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('sites', (table) => {
    table.dropUnique('domain');
  });
};