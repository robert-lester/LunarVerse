exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.createTableIfNotExists('source_tags', (table) => {
      table.integer('source_id');
      table.integer('tag_id');
      table.timestamps();
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.dropTableIfExists('source_tags'),
  ]);
};
