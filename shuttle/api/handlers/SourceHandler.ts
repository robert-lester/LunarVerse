import { SourceRouter } from '../routers';
import { BaseHandler } from './BaseHandler';

class SourceHandler extends BaseHandler {}

export const handler = SourceHandler.handler(SourceRouter);
