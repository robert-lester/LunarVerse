
exports.up = knex => knex.schema.alterTable('messages', (table) => {
  table.integer('billable_units').default(0);
});

exports.down = knex => knex.schema.alterTable('messages', (table) => {
  table.dropColumn('billable_units');
});
