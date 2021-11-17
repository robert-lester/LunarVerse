exports.up = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('sites', (table) => {
      table.uuid('group_uid');
    }),

    knex.schema.table('users', (table) => {
      table.boolean('is_administrator');
      table.json('permissions');
    }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([
    knex.schema.table('sites', (table) => {
      table.dropColumn('group_uid');
    }),

    knex.schema.table('users', (table) => {
      table.dropColumn('is_administrator');
      table.dropColumn('permissions');
    }),
  ]);
};