import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as rookout from 'rookout/lambda';
import * as warmer from 'lambda-warmer';

// The locations of the following modules are aliased using the module 
// resolution path maps in tsconfig. Webpack includes a plugin to resolve
// path mappings present in tsconfig.
// https://www.typescriptlang.org/docs/handbook/module-resolution.html#base-url
import init from '../server/index';
import * as uplinkJson from '../../../package.json';
import * as coreJson from '../../../../core/package.json';

// typescript ^3.1.6 does not support 'non-default' or aliased imports from
// JS modules that do not have a default named export. stackoverflow suggests
// using the esModuleInterop compiler flag. However, enabling that flag causes
// many other errors on imports.
import sls = require('serverless-http');

export abstract class BaseHandler {
  public static server: Koa;

  public static handler(router: any) {
    console.info(`Uplink Version: ${(uplinkJson as any).version}`);
    console.info(`Core Version: ${(coreJson as any).version}`);

    this.buildHttpServer(router);

    const serverlessHttpHandler = sls(this.server, {
      request: (request, event) => {
        if (!process.env.IS_OFFLINE) {
          request.url = event.requestContext.path.replace('uplink/', '');
        }
      }
    });

    return rookout.wrap((event, context, callback) => {
      warmer(event).then((isWarmer: boolean) => {
        if (isWarmer) {
          // Exit as early as possible when warming up in order to minimize
          // Lambda execution duration. AWS charges based on memory size and
          // duration (per 100 ms).
          callback(null, 'warmed');
        }
        else {
          // CloudFront adds the header to the viewer request before forwarding
          // the request to your origin. The header value contains an encrypted
          // string that uniquely identifies the request. By printing the
          // CloudFront ID, there is traceability from API Gateway execution to
          // Lambda execution.
          if (!process.env.IS_OFFLINE && process.env.STAGE !== 'test') {
            if ('X-Amz-Cf-Id' in event.headers) {
              console.info(`X-Amz-Cf-Id=${event.headers['X-Amz-Cf-Id']}`);
            }
            else {
              console.error('Failed to find the CloudFront ID header');
            }
          }
          serverlessHttpHandler(event, context, callback);
        }
      });
    });
  }

  protected static buildHttpServer(router: any) {
    const routes: Router = router();

    this.server = init();
    this.server.use(routes.routes());
    this.server.use(routes.allowedMethods());
  }
}
