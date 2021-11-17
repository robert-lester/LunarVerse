import { IKoaContext } from '../../@types';
import { checkCORS } from '../../../../../lib/lambda++';

export async function corsHandler(ctx: IKoaContext, next: any): Promise<any> {
  if (ctx.request.url) {
    // TODO: Expose the set of handlers with CORS checking enabled and remove this hack. Lame.
    if (ctx.request.url.includes('/api') && ctx.method === 'POST' && ctx.request.body && ctx.request.body.query && ctx.request.body.query.includes('getCrmMessages')) {
      ctx.set('Access-Control-Allow-Origin', '*');
    }
    else if (ctx.request.url.includes('/api') &&  process.env.CORS_ORIGIN && !process.env.IS_OFFLINE && process.env.STAGE !== 'test') {
      const origin = ctx.request.header.origin;

      const result = checkCORS(origin, process.env.CORS_ORIGIN);

      if (result.statusCode !== 200) {
        ctx.throw(result.statusCode, result.message);
      }

      ctx.set('Access-Control-Allow-Origin', origin);
    }
    else {
      ctx.set('Access-Control-Allow-Origin', '*');
    }
  }
  else {
    ctx.throw(500, 'The context request did not contain a valid URL.');
  }

  await next();
}
