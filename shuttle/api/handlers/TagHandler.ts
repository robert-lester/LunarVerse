import { TagRouter } from '../routers';
import { BaseHandler } from './BaseHandler';

class TagHandler extends BaseHandler {}

export const handler = TagHandler.handler(TagRouter);
