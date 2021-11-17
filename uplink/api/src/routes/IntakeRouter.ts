import * as Router from 'koa-router';
import BaseRouter from './BaseRouter';
import { IRouter } from './interfaces';
import { text, voice } from '../intake';
import { Context } from '../context';
import { IKoaContext } from '../@types';
import TwilioClient from '../lib/twilio';
import { twilioBadRequest } from '../lib/response';

class IntakeRouter extends BaseRouter implements IRouter {
  constructor() {
    super();

    const twilio = new TwilioClient();
    this.router.prefix('/intake/');
    this.router.use(async (ctx: IKoaContext, next: any) => {
      if (!process.env.IS_OFFLINE || process.env.IS_OFFLINE !== 'true' || process.env.STAGE.includes('prod')) {
        if (!twilio.validRequest(ctx)) {
          if ('x-twilio-signature' in ctx.request.header === false) {
            console.error('The request is missing an x-twilio-signature header.');
          }
          return twilioBadRequest(ctx, 'The request does not contain a valid Twilio signature!');
        }
      }

      await next();
    });
    this.router.post('/text', (ctx: IKoaContext): Promise<any> => text(new Context(ctx)));
    this.router.post('/voice', (ctx: IKoaContext): Promise<any> => voice(new Context(ctx)));
  }
}

export const intakeRouter = (): Router => new IntakeRouter().getRouter();
