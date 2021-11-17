module.exports = {
  dev: {
    client: 'mysql',
    connection: {
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
    },
    debug: process.env.DEBUG,
    pool: {
      max: 1,
      min: 1,
    },
  },
  qa: {
    client: 'mysql',
    connection: {
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
    },
    debug: process.env.DEBUG,
    pool: {
      max: 1,
      min: 1,
    },
  },
  staging: {
    client: 'mysql',
    connection: {
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
    },
    debug: process.env.DEBUG,
    pool: {
      max: 1,
      min: 1,
    },
  },
  demo: {
    client: 'mysql',
    connection: {
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
    },
    debug: process.env.DEBUG,
    pool: {
      max: 1,
      min: 1,
    },
  },
  production: {
    client: 'mysql',
    connection: {
      database: process.env.DB_DATABASE,
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
    },
    debug: process.env.DEBUG,
    pool: {
      max: 1,
      min: 1,
    },
  },
};
