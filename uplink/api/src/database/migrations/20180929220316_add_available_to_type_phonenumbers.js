
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.table('phonenumbers', table => {
      table.enum('type', ['USER','CONTACT','POOL','FORWARD','UNASSIGNED','AVAILABLE']).alter();
      table.timestamp('last_communication').nullable();
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.table('phonenumbers', table => {
      table.enum('type', ['USER','CONTACT','POOL','FORWARD','UNASSIGNED']).alter();
      table.dropColumn('last_communication');
    }),
  ]);
};
