import * as Koa from 'koa';

export default interface IRouterArchivable {
  archive(ctx: Koa.Context, next: any): Promise<any>;
  restore(ctx: Koa.Context, next: any): Promise<any>;
}
