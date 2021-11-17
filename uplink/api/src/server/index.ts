import * as bodyparser from 'koa-bodyparser';
import * as helmet from 'koa-helmet';
import * as Koa from 'koa';

import {
  corsHandler,
  dbHandler,
  errorHandler,
  logHandler,
  noSQLHandler,
  redisHandler
} from './middleware';

export default function init(): Koa {
  const app = new Koa();

  app
    // Security middleware
    .use(helmet())
    // Server level error handling middleware
    .use(errorHandler)
    // Logging middleware
    .use(logHandler)
    .use(noSQLHandler)
    // Database connection middleware
    .use(dbHandler)
    .use(redisHandler)
    .use(bodyparser())
    .use(corsHandler); // The CORS handler attempts to interpret the body of the request

  return app;
}
