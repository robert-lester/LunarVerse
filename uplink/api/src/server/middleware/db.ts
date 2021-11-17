import * as Knex from 'knex';
import knexfile from '../../database/knexfile';
import { IKoaContext } from '../../@types';

export async function dbHandler(ctx: IKoaContext, next: any): Promise<any> {
  ctx.db = Knex(knexfile);
  await next();
  await ctx.db.destroy().then(() => console.error('connection ended'));
}
