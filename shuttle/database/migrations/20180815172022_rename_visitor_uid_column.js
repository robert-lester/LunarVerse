
exports.up = function(knex, Promise) {
  return knex.schema.table('visitors', (table) => {
    table.renameColumn('uid', 'id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('visitors', (table) => {
    table.renameColumn('id', 'uid');
  });
};
