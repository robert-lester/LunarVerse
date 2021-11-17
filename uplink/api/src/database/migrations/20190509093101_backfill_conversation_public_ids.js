const generatePublicId = require('uuid/v4');

exports.up = async (knex) => {
  const conversations = await knex('conversations').whereNull('public_id');

  await Promise.all(conversations.map(conversation => knex('conversations')
    .update({ public_id: generatePublicId() })
    .where('id', conversation.id)));
  await knex.schema.alterTable('conversations', table => table.uuid('public_id').alter().notNullable());
};

exports.down = knex => knex.schema.alterTable('conversations', table => table.uuid('public_id').alter().nullable());
