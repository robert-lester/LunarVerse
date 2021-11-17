exports.up = function(knex, Promise) {
  return knex.schema.alterTable('visitors', (table) => {
    table.string('fingerprint', 5000).alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('visitors', (table) => {
      table.string('fingerprint').alter();
  });
};