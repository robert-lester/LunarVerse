
exports.up = knex => knex.schema.table('messages', (table) => {
  table.renameColumn('minutes', 'duration');
});

exports.down = knex => knex.schema.table('messages', (table) => {
  table.renameColumn('duration', 'minutes');
});
