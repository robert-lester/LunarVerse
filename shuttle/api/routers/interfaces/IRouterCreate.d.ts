import * as Koa from 'koa';

export default interface IRouterCreate {
  create(ctx: Koa.Context, next: any): Promise<any>;
}
