/*
Lead
uid
data
name
phone
email*/
exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('leads', (table) => {
      table.uuid('uid').primary();
      table.json('data');
      table.string('name');
      table.string('phone');
      table.string('email');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('leads'),
  ]);
};