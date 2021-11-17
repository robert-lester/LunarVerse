exports.up = (knex, Promise) => Promise.all([
  knex.schema.renameTable('destination_sources', 'destinations_sources'),
  knex.schema.renameTable('destination_tags', 'destinations_tags'),
  knex.schema.renameTable('source_tags', 'sources_tags'),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.renameTable('destinations_sources', 'destination_sources'),
  knex.schema.renameTable('destinations_tags', 'destination_tags'),
  knex.schema.renameTable('sources_tags', 'source_tags'),
]);
