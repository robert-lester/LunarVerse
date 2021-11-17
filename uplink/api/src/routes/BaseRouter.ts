import * as Router from 'koa-router';
import { IRouter } from './interfaces';

export default abstract class BaseRouter implements IRouter {
  public router: Router;

  constructor() {
    this.router = new Router();
  }

  public getRouter(): Router {
    return this.router;
  }
}
