exports.up = function (knex, Promise) {
  return knex.schema.createTable('mapping', (table) => {
    table.increments('id').primary();
    table.uuid('uid_1');
    table.uuid('uid_2');
    table.string('reason');
    table.integer('user_id').defaultTo('0'); // 0 for automated mapping
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('mapping');
};