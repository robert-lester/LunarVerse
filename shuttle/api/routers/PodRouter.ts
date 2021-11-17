import * as Router from 'koa-router';
import * as Types from '../../@types';
import BaseRouter from './BaseRouter';
import { IRouter, IRouterPaginate, IRouterCreate, IRouterRead } from './interfaces';
import { PodController } from '../controllers';

class PodRouter extends BaseRouter implements IRouter, IRouterPaginate, IRouterCreate, IRouterRead {
  public type: string = 'Pod';
  public router: Router;

  constructor() {
    super();
    this.router.prefix('/pods/');

    // Build routes
    this.router.use(this.resolveScopeIntoState);
    this.router.post('/paginate', this.paginate);
    this.router.post('/', this.create);
    this.router.get('/:id', this.read);
  }

  public async resolveScopeIntoState(
    ctx: Types.IKoaContext<PodController>,
    next: any,
  ): Promise<any> {
    try {
      ctx.state.controller = new PodController(ctx.db);
      ctx.logger.formattedLog('pods');

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async paginate(ctx: Types.IKoaContext<PodController>, next: any): Promise<any> {
    try {
      const { controller, options, organization } = ctx.state;
      controller.connect();
      const results = await controller.paginate(organization, options);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async create(ctx: Types.IKoaContext<PodController>, next: any): Promise<any> {
    try {
      const { controller, body, options, organization } = ctx.state;
      controller.connect();
      const results = await controller.create(organization, body, options);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async read(ctx: Types.IKoaContext<PodController>, next: any): Promise<any> {
    try {
      const { controller, options, organization } = ctx.state;
      controller.connect();
      const id = parseInt(ctx.params.id, 10);
      const results = await controller.read(organization, id, options);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }
}

export default (): Router => new PodRouter().getRouter();
