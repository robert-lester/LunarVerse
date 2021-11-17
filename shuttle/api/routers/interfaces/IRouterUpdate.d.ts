import * as Koa from 'koa';

export default interface IRouterUpdate {
  update(ctx: Koa.Context, next: any): Promise<any>;
}
