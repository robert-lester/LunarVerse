exports.up = async (knex) => {
  await knex('messages')
    .update({
      from_phone_id: knex.raw('messages.phone_id'),
    })
    .whereNull('from_phone_id');

  await knex.schema.alterTable('messages', (table) => {
    table.dropColumn('phone_id');
    table.renameColumn('user', 'sender_snapshot');

    table.json('recipient_snapshot');
    table.enum('call_status', ['BUSY', 'COMPLETED', 'FAILED', 'INCOMPLETE', 'NO_ANSWER']);
    table.timestamp('call_dialed_at').nullable();
    table.timestamp('call_rang_at').nullable();
    table.timestamp('call_started_at').nullable();
    table.timestamp('call_completed_at').nullable();
  });
};

exports.down = knex => knex.schema.alterTable('messages', (table) => {
  table.integer('phone_id');

  table.renameColumn('sender_snapshot', 'user');
  table.dropColumn('recipient_snapshot');
  table.dropColumn('call_status');
  table.dropColumn('call_dialed_at');
  table.dropColumn('call_rang_at');
  table.dropColumn('call_started_at');
  table.dropColumn('call_completed_at');
});
