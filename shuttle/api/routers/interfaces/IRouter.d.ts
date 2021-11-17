import * as Router from 'koa-router';
import * as Koa from 'koa';

export default interface IRouter {
  type: string;
  router: Router;
  getRouter(): Router;
  resolveScopeIntoState(ctx: Koa.Context, next: any): Promise<any>;
}
