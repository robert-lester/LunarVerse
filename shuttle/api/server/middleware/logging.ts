import Logger from '../../../../lib/logger';
import { IKoaContext } from '../../../@types';

export async function logHandler(ctx: IKoaContext, next: any): Promise<any> {
  ctx.logger = new Logger('shuttle:server');
  ctx.logger.log('server setup');
  await next();
}
