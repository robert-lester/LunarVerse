exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('messages', table => {
      table.index(['organization_id', 'conversation_id']);
      table.index(['organization_id', 'phone_id']);
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.table('messages', table => {
      table.dropIndex(['organization_id', 'conversation_id']);
      table.dropIndex(['organization_id', 'phone_id']);
    }),
  ]);
