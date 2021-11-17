exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTable('events', (table) => {
      table.uuid('uid').primary();
      table.uuid('visitor_uid');
      table.uuid('visit_uid');
      table.integer('type_id');
      table.uuid('site_uid');
      table.json('data');
      table.uuid('event_uid');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('events'),
  ]);
};