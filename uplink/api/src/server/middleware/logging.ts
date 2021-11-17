import Logger from '../../../../../lib/logger';
import { IKoaContext } from '../../@types';

export async function logHandler(ctx: IKoaContext, next: any): Promise<any> {
  ctx.logger = new Logger('uplink:server');
  ctx.logger.log('server setup');
  await next();
  if (ctx.response.status && ctx.response.status !== 200) {
    ctx.logger.log(`response status code: ${ctx.response.status}`);
    ctx.logger.log(`response status message: ${ctx.response.message}`);
    ctx.logger.log(`response headers: ${JSON.stringify(ctx.response.headers)}`);
    ctx.logger.log(`response body: ${JSON.stringify(ctx.response.body)}`);
  }
}
