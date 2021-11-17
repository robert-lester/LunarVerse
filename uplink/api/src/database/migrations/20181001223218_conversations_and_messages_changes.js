
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.table('conversations', table => {
      table.integer('user_phone_id');
      table.integer('contact_user_id');
    }),
    knex.schema.table('messages', table => {
      table.integer('user_phone_id');
      table.integer('contact_user_id');
      table.integer('minutes').default(0);
      table.enum('type', ['USER','SYSTEM','CALL']).alter();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  
};
