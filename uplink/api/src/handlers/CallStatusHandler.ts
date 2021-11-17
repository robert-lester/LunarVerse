import { callStatusRouter } from '../routes';
import { BaseHandler } from './BaseHandler';

class CallStatusHandler extends BaseHandler {}

export const handler = CallStatusHandler.handler(callStatusRouter);