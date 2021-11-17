import * as Router from 'koa-router';
import * as Types from '../../@types';
import { IRouter } from './interfaces';

export default abstract class BaseRouter implements IRouter {
  public type: string;
  public router: Router;

  constructor() {
    this.router = new Router();
  }

  public getRouter(): Router {
    return this.router;
  }

  public abstract async resolveScopeIntoState(ctx: Types.IKoaContext, next: any): Promise<any>;
}
