
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.table('messages', table => {
      table.integer('user_id');
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.table('messages', table => {
      table.dropColumn('user_id');
    }),
  ]);
};
