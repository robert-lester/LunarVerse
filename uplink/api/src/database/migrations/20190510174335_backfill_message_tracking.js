exports.up = knex => knex('messages')
  .update({
    call_completed_at: knex.raw('messages.updated_at'),
    call_status: 'COMPLETED',
  })
  .whereNull('call_status')
  .andWhere('type', 'CALL');

exports.down = () => {};