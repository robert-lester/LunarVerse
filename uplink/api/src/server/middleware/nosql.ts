import * as NosQL from '../../../../../lib/nos-ql';
import { IKoaContext } from '../../@types';

export async function noSQLHandler(ctx: IKoaContext, next: any): Promise<any> {
  ctx.nosql = new NosQL({ region: 'us-east-1' });
  await next();
}
