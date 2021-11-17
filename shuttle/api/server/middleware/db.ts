import * as Knex from 'knex';
import knexfile from '../../../database/knexfile';
import { IKoaContext } from '../../../@types';

export async function dbHandler(ctx: IKoaContext, next: any): Promise<any> {
  ctx.db = Knex(knexfile);
  await next();
  ctx.db.destroy().then(() => ctx.logger.log('connection ended'));
}
