exports.up = knex => Promise.all([
  knex('phonenumbers')
    .update('updated_at', knex.raw('last_communication'))
    .where('last_communication', '>', knex.raw('updated_at')),
  knex('phonenumbers')
    .update({
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    })
    .where({
      created_at: null,
      updated_at: null,
    }),
  knex('phonenumbers')
    .update('type', 'POOL')
    .where('organization_id', 'lunar-pool'),
]);
exports.down = async () => {};