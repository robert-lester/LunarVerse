import * as Router from 'koa-router';
import * as Koa from 'koa';
import { DataLoadersContext, ServicesContext } from '../../context';

export interface IRouter {
  router: Router;
  getRouter(): Router;
}
