import * as Koa from 'koa';

export default interface IRouterRead {
  read(ctx: Koa.Context, next: any): Promise<any>;
}
