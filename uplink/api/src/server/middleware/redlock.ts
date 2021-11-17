import { RedlockService } from '../../lib/redlock';
import { IKoaContext } from '../../@types';

export const redisHandler = async (ctx: IKoaContext, next: any): Promise<void> => {
  const redisClientEndpoints = process.env.REDIS_REDLOCK_CLIENT_ENDPOINTS.split(',');

  ctx.logger.log('Setting up Redlock...');
  ctx.locks = new RedlockService(redisClientEndpoints);
  ctx.logger.log('Redlock ready');
  await next();
  ctx.logger.log('Tearing down Redlock...');
  await ctx.locks.disconnect();
  ctx.logger.log('Redlock down');
};