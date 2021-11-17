exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.createTableIfNotExists('conversations_phonenumbers', table => {
      table.integer('conversation_id');
      table.integer('phone_id');
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([knex.schema.dropTableIfExists('conversations_phonenumbers')]);
