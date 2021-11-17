import { DestinationRouter } from '../routers';
import { BaseHandler } from './BaseHandler';

class DestinationHandler extends BaseHandler {}

export const handler = DestinationHandler.handler(DestinationRouter);
