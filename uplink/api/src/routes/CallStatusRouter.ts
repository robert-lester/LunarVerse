import * as Router from 'koa-router';
import * as moment from 'moment';
import BaseRouter from './BaseRouter';
import { IRouter } from './interfaces';
import { IKoaContext } from '../@types';
import {
  ITwilioCallStatusRequest,
  TwilioDuringCallStatuses,
  TwilioFinalCallStatuses,
} from '../@types';
import { Context, ServicesContext } from '../context';
import { twilioSuccess, twilioError } from '../lib/response';

class CallStatusRouter extends BaseRouter implements IRouter {
  constructor() {
    super();

    this.router.prefix('/callStatus/');
    this.router.post('/', (ctx: IKoaContext): Promise<any> => this.updateCallStatus(new Context(ctx)));
  }

  public async updateCallStatus({ Context: ctx, Services }: { Context: IKoaContext, Services: ServicesContext }): Promise<any> {
    try {
      const now = moment.utc().toISOString();
      const { CallDuration, CallSid, CallStatus } = ctx.request.body as ITwilioCallStatusRequest;

      switch (CallStatus) {
        case TwilioDuringCallStatuses.INITIATED:
          await Services.MessageService.update(CallSid, {
            call_dialed_at: now,
          });
          break;
        case TwilioDuringCallStatuses.RINGING:
          await Services.MessageService.update(CallSid, {
            call_rang_at: now,
          });
          break;
        case TwilioDuringCallStatuses.IN_PROGRESS:
          await Services.MessageService.update(CallSid, {
            call_started_at: now,
          });
          break;
        case TwilioFinalCallStatuses.BUSY:
        case TwilioFinalCallStatuses.COMPLETED:
        case TwilioFinalCallStatuses.FAILED:
        case TwilioFinalCallStatuses.NO_ANSWER:
          let dbCallStatus;
          let billable_units = 0;
          switch (CallStatus) {
            case TwilioFinalCallStatuses.BUSY:
              dbCallStatus = 'BUSY';
              break;
            case TwilioFinalCallStatuses.COMPLETED:
              dbCallStatus = 'COMPLETED';
              billable_units = Math.ceil(CallDuration / 60);
              break;
            case TwilioFinalCallStatuses.FAILED:
              dbCallStatus = 'FAILED';
              break;
            case TwilioFinalCallStatuses.NO_ANSWER:
              dbCallStatus = 'NO_ANSWER';
              break;
          }
          await Services.MessageService.update(CallSid, {
            duration: CallStatus === TwilioFinalCallStatuses.COMPLETED ? CallDuration : 0,
            call_completed_at: now,
            call_status: dbCallStatus,
            billable_units
          });
          break;
        case TwilioDuringCallStatuses.QUEUED:
        default:
      }
      return twilioSuccess(ctx);
    } catch (err) {
      console.error(err);
      return twilioError(ctx, 'Uplink has encountered an internal system error.');
    }
  }
}

export const callStatusRouter = (): Router => new CallStatusRouter().getRouter();