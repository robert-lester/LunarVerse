exports.up = (knex, Promise) => Promise.all([
  knex.schema.createTableIfNotExists('themes', (table) => {
    table.increments('id');
    table.string('name');
    table.text('css', 'mediumtext');
    table.text('structure', 'longtext');
    table.timestamps();
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.dropTableIfExists('themes'),
]);
