import * as Router from 'koa-router';
import * as Types from '../../@types';
import BaseRouter from './BaseRouter';
import { IRouter, IRouterIndex, IRouterCreate, IRouterArchivable } from './interfaces';
import { RelayController } from '../controllers';

class RelayRouter extends BaseRouter
  implements IRouter, IRouterIndex, IRouterCreate, IRouterArchivable {
  public type: string = 'Relay';
  public router: Router;

  constructor() {
    super();
    this.router.prefix('/relays/');

    // Build routes
    this.router.use(this.resolveScopeIntoState);
    this.router.get('/', this.index);
    this.router.post('/', this.create);
    this.router.del('/:id', this.archive);
    this.router.put('/:id', this.restore);
  }

  public async resolveScopeIntoState(
    ctx: Types.IKoaContext<RelayController>,
    next: any,
  ): Promise<any> {
    try {
      ctx.state.controller = new RelayController(ctx.db);
      ctx.logger.formattedLog('relay');

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async index(ctx: Types.IKoaContext<RelayController>, next: any): Promise<any> {
    try {
      const { controller, organization } = ctx.state;
      controller.connect();
      const results = await controller.index(organization);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async create(ctx: Types.IKoaContext<RelayController>, next: any): Promise<any> {
    try {
      const { controller, body, organization } = ctx.state;
      controller.connect();
      const results = await controller.create(organization, body);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async archive(ctx: Types.IKoaContext<RelayController>, next: any): Promise<any> {
    try {
      const { controller, organization } = ctx.state;
      controller.connect();
      const id = parseInt(ctx.params.id, 10);
      const results = await controller.archive(organization, id);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async restore(ctx: Types.IKoaContext<RelayController>, next: any): Promise<any> {
    try {
      const { controller, organization } = ctx.state;
      controller.connect();
      const id = parseInt(ctx.params.id, 10);
      const results = await controller.archive(organization, id);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }
}

export default (): Router => new RelayRouter().getRouter();
