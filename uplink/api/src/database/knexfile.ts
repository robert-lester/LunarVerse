import * as Knex from 'knex';
export default {
    client: 'mysql',
    connection: {
      // Change these to env values to run `knex seed:run`
      user: process.env.DATABASE_USER,
      host: process.env.DATABASE_HOST,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_DATA,
      charset: 'utf8mb4',
      timezone: 'UTC'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
} as Knex.Config;
