import * as Koa from 'koa';

export default interface IRouterPaginate {
  paginate(ctx: Koa.Context, next: any): Promise<any>;
}
