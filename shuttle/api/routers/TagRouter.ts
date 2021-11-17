import * as Router from 'koa-router';
import * as Types from '../../@types';
import BaseRouter from './BaseRouter';
import { IRouter, IRouterIndex, IRouterCreate, IRouterDelete } from './interfaces';
import { TagController } from '../controllers';

class TagRouter extends BaseRouter implements IRouter, IRouterIndex, IRouterCreate, IRouterDelete {
  public type: string = 'Tag';
  public router: Router;

  constructor() {
    super();
    this.router.prefix('/tags/');

    // Build routes
    this.router.use(this.resolveScopeIntoState);
    this.router.get('/', this.index);
    this.router.post('/', this.create);
    this.router.del('/:id', this.delete);
  }

  public async resolveScopeIntoState(
    ctx: Types.IKoaContext<TagController>,
    next: any,
  ): Promise<any> {
    try {
      ctx.state.controller = new TagController(ctx.db);
      ctx.logger.formattedLog('tags');

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async index(ctx: Types.IKoaContext<TagController>, next: any): Promise<any> {
    try {
      const { controller, options, organization } = ctx.state;
      controller.connect();
      const results = await controller.index(organization, options);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async create(ctx: Types.IKoaContext<TagController>, next: any): Promise<any> {
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

  public async delete(ctx: Types.IKoaContext<TagController>, next: any): Promise<any> {
    try {
      const { controller, organization } = ctx.state;
      controller.connect();
      const id = parseInt(ctx.params.id, 10);
      const results = await controller.delete(organization, id);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }
}

export default (): Router => new TagRouter().getRouter();
