
exports.up = (knex, Promise) => Promise.all([
  knex.schema.dropTableIfExists('conversations_phonenumbers'),
  knex.schema.dropTableIfExists('invites'),
  knex.schema.dropTableIfExists('phonenumbers_users'),
  knex.schema.table('messages', (table) => {
    table.dropColumn('user_phone_id');
    table.dropColumn('contact_user_id');
    table.dropColumn('user_id');
  }),
  knex.schema.table('users', (table) => {
    table.dropColumn('initialOptIn');
    table.dropColumn('shouldContact');
    table.dropColumn('opt_in');
    table.dropColumn('opt_out');
  }),
]);

exports.down = (knex, Promise) => Promise.all([
  knex.schema.createTableIfNotExists('conversations_phonenumbers', (table) => {
    table.integer('conversation_id');
    table.integer('phone_id');
  }),
  knex.schema.createTableIfNotExists('invites', (table) => {
    table.increments('id');
    table.string('organization_id').notNullable().unique();
    table.string('message');
    table.timestamps();
  }),
  knex.schema.createTableIfNotExists('phonenumbers_users', (table) => {
    table.integer('phone_id');
    table.integer('user_id');
  }),
  knex.schema.table('messages', (table) => {
    table.integer('user_phone_id');
    table.integer('contact_user_id');
    table.integer('user_id');
  }),
  knex.schema.table('users', (table) => {
    table.boolean('initialOptIn').notNullable();
    table.boolean('shouldContact').notNullable();
    table.dateTime('opt_in').nullable();
    table.dateTime('opt_out').nullable();
  }),
]);
