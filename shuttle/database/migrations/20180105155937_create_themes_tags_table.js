exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTableIfNotExists('themes_tags', (table) => {
    table.integer('theme_id');
    table.integer('tag_id');
    table.timestamps();
    // table.primary(['theme_id', 'tag_id']);
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.dropTableIfExists('themes_tags'),
]);
