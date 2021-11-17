
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('phonenumbers', (table) => {
      // TODO: Remove "RECYCLED" type since it's no longer used within the app
      table.enum('type',['USER','CONTACT','POOL','FORWARD','UNASSIGNED','RECYCLED']).alter();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('phonenumbers', (table) => {
      table.enum('type','USER','CONTACT','POOL','FORWARD','UNASSIGNED','AVAILABLE').alter();
    }),
  ]);
};
