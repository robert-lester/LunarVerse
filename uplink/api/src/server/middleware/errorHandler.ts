import { IKoaContext } from '../../@types';

export async function errorHandler(ctx: IKoaContext, next: any): Promise<any> {
  try {
    await next();
  } catch (err) {
    await ctx.db.destroy().then(() => ctx.logger.log('error: connection ended'));
    ctx.logger.log('Tearing down Redlock...');
    await ctx.locks.disconnect();
    ctx.logger.log('Redlock down');
    ctx.status = err.statusCode || 500;
    ctx.body = err.toJSON ? err.toJSON() : { message: err.message, ...err };
    if (!process.env.EMIT_STACK_TRACE) {
      delete ctx.body.stack;
    }
    ctx.logger.log('%O', err);
  }
}
