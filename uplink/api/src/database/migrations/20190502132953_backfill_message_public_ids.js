const generatePublicId = require('uuid/v4');

exports.up = async (knex) => {
  const messages = await knex('messages').whereNull('public_id');

  await Promise.all(messages.map(message => knex('messages')
    .update({ public_id: generatePublicId() })
    .where('id', message.id)));
  await knex.schema.alterTable('messages', table => table.uuid('public_id').alter().notNullable());
};

exports.down = knex => knex.schema.alterTable('messages', table => table.uuid('public_id').alter().nullable());
