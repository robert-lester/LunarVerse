/*
Visitor
uid
site_uid
fingerprint
data
lead_uid
*/

exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('visitors', (table) => {
      table.uuid('uid').primary();
      table.uuid('site_uid');
      table.uuid('lead_uid');
      table.string('fingerprint');
      table.json('data');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('visitors'),
  ]);
};