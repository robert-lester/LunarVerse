import * as Koa from 'koa';

export default interface IRouterDelete {
  delete(ctx: Koa.Context, next: any): Promise<any>;
}
