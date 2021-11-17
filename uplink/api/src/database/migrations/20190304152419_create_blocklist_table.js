exports.up = knex => knex.schema.createTableIfNotExists('blocklist', table => {
  table.integer('from_user_id').unsigned();
  table.integer('to_user_id').unsigned();
  table.boolean('blocked');
  table.string('organization_id');
  table.timestamps();
});

exports.down = knex => knex.schema.dropTableIfExists('blocklist');