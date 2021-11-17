
exports.up = knex => knex.schema.alterTable('conversations', (table) => {
  table.datetime('conversation_last_started_at');
});

exports.down = knex => knex.schema.alterTable('conversations', (table) => {
  table.dropColumn('conversation_last_started_at');
});
