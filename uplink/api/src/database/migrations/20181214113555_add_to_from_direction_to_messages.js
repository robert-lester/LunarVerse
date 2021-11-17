
exports.up = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.integer('from_phone_id');
      table.integer('to_phone_id');
      table.enum('direction', ['INBOUND', 'OUTBOUND']);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  Promise.all([
    knex.schema.alterTable('messages', (table) => {
      table.dropColumn('from_phone_id');
      table.dropColumn('to_phone_id');
      table.dropColumn('direction');
    }),
  ]);
};
