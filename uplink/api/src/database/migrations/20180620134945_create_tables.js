exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.createTableIfNotExists('invites', table => {
      table.increments('id');
      table.string('organization_id');
      table.string('message');
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('messages', table => {
      table.increments('id');
      table.string('organization_id');
      table.binary('message');
      table.binary('media');
      table.integer('conversation_id');
      table.integer('phone_id');
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('phonenumbers', table => {
      table.increments('id');
      table.string('organization_id');
      table.string('systemNumber');
      table.boolean('notified');
      table.string('sid');
      table.enum('type', ['USER', 'CONTACT', 'POOL']);
      table.timestamps();
    }),
    knex.schema.createTableIfNotExists('phonenumbers_users', table => {
      table.integer('phone_id');
      table.integer('user_id');
    }),
    knex.schema.createTableIfNotExists('users', table => {
      table.increments('id');
      table.string('organization_id');
      table.boolean('initialOptIn');
      table.boolean('shouldContact');
      table.string('physicalNumber');
      table.string('name');
      table.enum('type', ['USER', 'CONTACT']);
      table.timestamps();
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.dropTableIfExists('invites'),
    knex.schema.dropTableIfExists('messages'),
    knex.schema.dropTableIfExists('phonenumbers'),
    knex.schema.dropTableIfExists('phonenumbers_users'),
    knex.schema.dropTableIfExists('users'),
  ]);
