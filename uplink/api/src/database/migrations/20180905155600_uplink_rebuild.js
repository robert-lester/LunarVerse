
exports.up = function(knex, Promise) {
    Promise.all([
        knex.schema.table('phonenumbers', table => {
          table.integer('user_id', 10).nullable();
          table.integer('forward_id', 10).nullable();
          table.enum('type', ['USER','CONTACT','POOL','FORWARD','UNASSIGNED']).alter();
        }),
      ]);
      Promise.all([
        knex.schema.table('messages', table => {
            table.enum('type', ['USER', 'SYSTEM']).defaultTo('USER');
        }),
      ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.table('phonenumbers', table => {
      table.dropColumn('user_id');
      table.dropColumn('forward_id');
      table.enum('type', ['USER','CONTACT','POOL']).alter();
    }),
  ]);
  Promise.all([
    knex.schema.table('messages', table => {
      table.dropColumn('type');
    }),
  ]);
};
