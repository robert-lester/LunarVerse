import * as Router from 'koa-router';
import * as Types from '../../@types';
import BaseRouter from './BaseRouter';
import {
  IRouter,
  IRouterIndex,
  IRouterCreate,
  IRouterRead,
  IRouterUpdate,
  IRouterArchivable,
} from './interfaces';
import { SourceController, PodController } from '../controllers';

class SourceRouter extends BaseRouter
  implements IRouter, IRouterIndex, IRouterCreate, IRouterRead, IRouterUpdate, IRouterArchivable {
  public type: string = 'Source';
  public router: Router;

  constructor() {
    super();
    this.router.prefix('/sources/');

    // Build routes
    this.router.use(this.resolveScopeIntoState);
    this.router.get('/', this.index);
    this.router.post('/', this.create);
    this.router.get('/:id', this.read);
    this.router.patch('/:id', this.update);
    this.router.del('/:id', this.archive);
    this.router.put('/:id', this.restore);
  }

  public async resolveScopeIntoState(
    ctx: Types.IKoaContext<SourceController>,
    next: any,
  ): Promise<any> {
    try {
      ctx.state.controller = new SourceController(ctx.db);
      ctx.logger.formattedLog('sources');

      await next();
    } catch (err) {
      throw err;
    }
  }

  public async index(ctx: Types.IKoaContext<SourceController>, next: any): Promise<any> {
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
  public async create(ctx: Types.IKoaContext<SourceController>, next: any): Promise<any> {
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
  public async read(ctx: Types.IKoaContext<SourceController>, next: any): Promise<any> {
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
  public async update(ctx: Types.IKoaContext<SourceController>, next: any): Promise<any> {
    try {
      const { controller, body, options, organization } = ctx.state;
      controller.connect();
      const id = parseInt(ctx.params.id, 10);
      body.id = id;

      const results = await controller.update(organization, body, options);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }
  public async archive(ctx: Types.IKoaContext<SourceController>, next: any): Promise<any> {
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
  public async restore(ctx: Types.IKoaContext<SourceController>, next: any): Promise<any> {
    try {
      const { controller, options, organization } = ctx.state;
      controller.connect();
      const id = parseInt(ctx.params.id, 10);
      const results = await controller.restore(organization, id, options);

      ctx.body = results;
      ctx.status = 200;

      await next();
    } catch (err) {
      throw err;
    }
  }
}

export default (): Router => new SourceRouter().getRouter();
