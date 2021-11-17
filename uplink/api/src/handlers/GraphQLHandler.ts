import { graphQlRouter } from '../routes';
import { BaseHandler } from './BaseHandler';

class GraphQLHandler extends BaseHandler {}

export const handler = GraphQLHandler.handler(graphQlRouter);
