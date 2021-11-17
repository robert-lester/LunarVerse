import * as sls from 'serverless-http';
import * as Koa from 'koa';
import * as lambda from '../../../lib/lambda++';

import * as Types from '../../@types';
import { getOrganizationFromToken } from '../../../core/auth';
import createServer from '../server';

export abstract class BaseHandler {
  public static server: Koa;

  // Externally used handler
  public static handler(router) {
    this.buildHttpServer(router);
    return sls(this.server, {
      request: (request, event) => {
        /**
         * Because we are using the serverless domain plugin, we need to remove the
         *  'shuttle/' part of the request to allow url matching to work correctly
         */
        if (!process.env.IS_OFFLINE) {
          request.url = event.requestContext.path.replace('shuttle/', '');
        }
      },
    });
  }

  protected static async parser(ctx: Koa.Context, next: any): Promise<any> {
    // Parse GET variables and set to options
    const {
      withDestinations = false,
      withPods = false,
      withSources = false,
      withTags = true,
    } =
      ctx.request.query || {};
    const options: Types.ApiOptions = {
      withDestinations,
      withPods,
      withSources,
      withTags,
    };

    // Parse POST/PATCH bodies
    const request: any = ctx.request;
    const body = request.body ? lambda.parseBody(request.body) : {};

    // Grab organization
    const accessToken = lambda.parseToken(ctx.headers);
    const organization = await getOrganizationFromToken(accessToken);

    // Assign to Koa context
    ctx = BaseHandler.buildKoaContext(ctx, {
      accessToken,
      body,
      options,
      organization,
    });

    await next();
  }

  protected static buildKoaContext(ctx: Koa.Context, options): Koa.Context {
    // Link passed params to ctx.state.<OPTION>
    Object.keys(options).forEach((key) => {
      ctx.state[key] = options[key];
      return;
    });
    return ctx;
  }

  protected static buildHttpServer(router: any): void {
    const routes = router();

    // Create the server and add middleware
    this.server = createServer();
    this.server.use(this.parser);
    this.server.use(routes.routes());
    this.server.use(routes.allowedMethods());
  }
}
