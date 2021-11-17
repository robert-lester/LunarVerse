
exports.up = (knex, Promise) => knex.schema.alterTable('messages', (table) => {
  table.string('call_sid').nullable();
});

exports.down = (knex, Promise) => knex.schema.alterTable('messages', (table) => {
  table.dropColumn('call_sid');
});
