exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('conversations', table => {
      table
        .string('organization_id')
        .notNullable()
        .alter();
    }),
    knex.schema.table('invites', table => {
      table
        .string('organization_id')
        .notNullable()
        .alter();
    }),
    knex.schema.table('messages', table => {
      table
        .string('organization_id')
        .notNullable()
        .alter();
      table
        .integer('conversation_id')
        .notNullable()
        .alter();
      table
        .integer('phone_id')
        .notNullable()
        .alter();
    }),
    knex.schema.table('phonenumbers', table => {
      table
        .string('organization_id')
        .notNullable()
        .alter();
      table
        .string('systemNumber')
        .notNullable()
        .alter();
      table
        .boolean('notified')
        .notNullable()
        .defaultTo(false)
        .alter();
      table
        .string('sid')
        .notNullable()
        .alter();
      table
        .enum('type', ['USER', 'CONTACT', 'POOL'])
        .notNullable()
        .alter();
    }),
    knex.schema.table('users', table => {
      table
        .string('organization_id')
        .notNullable()
        .alter();
      table
        .boolean('initialOptIn')
        .notNullable()
        .defaultTo(false)
        .alter();
      table
        .boolean('shouldContact')
        .notNullable()
        .defaultTo(true)
        .alter();
      table
        .string('physicalNumber')
        .notNullable()
        .alter();
      table
        .enum('type', ['USER', 'CONTACT'])
        .notNullable()
        .alter();
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.table('conversations', table => {
      table
        .string('organization_id')
        .nullable()
        .alter();
    }),
    knex.schema.table('invites', table => {
      table
        .string('organization_id')
        .nullable()
        .alter();
    }),
    knex.schema.table('messages', table => {
      table
        .string('organization_id')
        .nullable()
        .alter();
      table
        .integer('conversation_id')
        .nullable()
        .alter();
      table
        .integer('phone_id')
        .nullable()
        .alter();
    }),
    knex.schema.table('phonenumbers', table => {
      table
        .string('organization_id')
        .nullable()
        .alter();
      table
        .string('systemNumber')
        .nullable()
        .alter();
      table
        .boolean('notified')
        .nullable()
        .alter();
      table
        .string('sid')
        .nullable()
        .alter();
      table
        .enum('type', ['USER', 'CONTACT', 'POOL'])
        .nullable()
        .alter();
    }),
    knex.schema.table('users', table => {
      table
        .string('organization_id')
        .nullable()
        .alter();
      table
        .boolean('initialOptIn')
        .nullable()
        .alter();
      table
        .boolean('shouldContact')
        .nullable()
        .alter();
      table
        .string('physicalNumber')
        .nullable()
        .alter();
      table
        .enum('type', ['USER', 'CONTACT'])
        .nullable()
        .alter();
    }),
  ]);
