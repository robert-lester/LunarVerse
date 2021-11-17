import * as Koa from 'koa';
import * as qs from 'qs';
import * as lambda from '../../../lib/lambda++';
import * as Types from '../../@types';
import { getOrganizationFromToken } from '../../../core/auth';
import { PodRouter } from '../routers';
import { BaseHandler } from './BaseHandler';

class PodHandler extends BaseHandler {
  protected static async parser(ctx: Koa.Context, next: any): Promise<any> {
    // Parse POST/PATCH bodies set to options
    const request: any = ctx.request;
    const body = request.body ? lambda.parseBody(request.body) : {};
    const { current = 1, pageSize = 25, errors = false, sources = '', destinations = '' } = body || {};

    const options: Types.PodApiOptions = {
      current,
      pageSize,
      destinations: destinations
        .split(',')
        .map((dest) => parseInt(dest.trim(), 10))
        .filter((dest) => !Number.isNaN(dest)),
      sources: sources
        .split(',')
        .map((source) => parseInt(source.trim(), 10))
        .filter((source) => !Number.isNaN(source)),
      errors,
    };

    // Grab organization
    const accessToken = lambda.parseToken(ctx.headers);
    const organization = await getOrganizationFromToken(accessToken);

    // Assign to Koa context
    ctx = BaseHandler.buildKoaContext(ctx, {
      options,
      organization,
      body,
      accessToken,
    });

    await next();
  }
}

export const handler = PodHandler.handler(PodRouter);
