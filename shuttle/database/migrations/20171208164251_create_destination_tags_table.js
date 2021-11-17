exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('destination_tags', (table) => {
      table.integer('destination_id');
      table.integer('tag_id');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('destination_tags'),
  ]);
};
