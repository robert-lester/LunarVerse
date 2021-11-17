import * as Koa from 'koa';

export default interface IRouterIndex {
  index(ctx: Koa.Context, next: any): Promise<any>;
}
