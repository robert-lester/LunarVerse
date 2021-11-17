import * as Koa from 'koa';
import * as bodyparser from 'koa-bodyparser';
import * as helmet from 'koa-helmet';
import { dbHandler, errorHandler, logHandler } from './middleware/';

import * as Types from '../../@types';

export default function createServer(): Koa {
  const server = new Koa();

  server
    .use(helmet())
    // CORS
    .use(
      async (ctx: Types.IKoaContext, next: any): Promise<void> => {
        ctx.set('Access-Control-Allow-Origin', '*');
        await next();
      },
    )
    // Error handler
    .use(errorHandler)
    // Logging utility
    .use(logHandler)
    // Database connection middleware
    .use(dbHandler)
    .use(bodyparser());

  return server;
}
