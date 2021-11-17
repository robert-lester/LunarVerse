exports.up = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', table => {
      table
        .enum('type', ['USER', 'CONTACT'])
        .notNullable()
        .alter();
    }),
    knex.schema.table('phonenumbers', table => {
      table
        .enum('type', ['USER', 'CONTACT', 'POOL'])
        .notNullable()
        .alter();
    }),
  ]);

exports.down = (knex, Promise) =>
  Promise.all([
    knex.schema.table('users', table => {
      table
        .enum('type', ['USER', 'CONTACT'])
        .nullable()
        .alter();
    }),
    knex.schema.table('phonenumbers', table => {
      table
        .enum('type', ['USER', 'CONTACT', 'POOL'])
        .nullable()
        .alter();
    }),
  ]);
