import { RelayRouter } from '../routers';
import { BaseHandler } from './BaseHandler';

class RelayHandler extends BaseHandler {}

export const handler = RelayHandler.handler(RelayRouter);
