exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('responses', (table) => {
      table.increments('id');
      table.integer('pod_id');
      table.integer('destination_id');
      table.integer('status_id');
      table.json('message');
      table.json('raw_message');
      table.integer('status_code');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('responses'),
  ]);
};
