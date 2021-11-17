import { IKoaContext } from '../../../@types';

export async function errorHandler(ctx: IKoaContext, next: any): Promise<any> {
  try {
    await next();
  } catch (err) {
    await ctx.db.destroy().then(() => console.error('error: connection ended'));
    ctx.status = err.statusCode || 500;
    if (err.hasOwnProperty('sql') || err.hasOwnProperty('sqlMessage')) {
      ctx.body = {};
    } else {
      ctx.body = err.toJSON ? err.toJSON() : { message: err.message, ...err };
    }
    if (!process.env.EMIT_STACK_TRACE) {
      delete ctx.body.stack;
    }

    ctx.logger.log('%O', err);
  }
}
