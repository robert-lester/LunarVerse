import * as Router from 'koa-router';
import * as bodyparser from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import * as depthLimit from 'graphql-depth-limit';
import costAnalysis from 'graphql-cost-analysis';
import BaseRouter from './BaseRouter';
import { IRouter } from './interfaces';
import schema from '../api';
import { Context } from '../context';
import { IKoaContext } from '../@types';
import { UplinkGraphQLException } from '../api/exceptions/UplinkGraphQLException';
import { filterXSS } from 'xss';

class GraphQLRouter extends BaseRouter implements IRouter {
  constructor() {
    super();

    this.router.prefix('/api/');
    this.router.post(
      '/',
      bodyparser(),
      graphqlKoa((ctx: IKoaContext) => ({
        schema,
        context: new Context(ctx),
        formatError: (err: UplinkGraphQLException) => {
          return {
            message: filterXSS(err.message),
            extensions: {
              code: err.originalError && (err.originalError as UplinkGraphQLException).code,
            },
            locations: err.locations,
            path: err.path
          }
        },
        validationRules: [
          depthLimit(10),
          costAnalysis({
            maximumCost: 750,
            defaultCost: 1,
            createError: (max, actual) => {
              const err = Error(
                `GraphQL query exceeds maximum complexity, (max: ${max}, actual: ${actual})`,
              );
              return err;
            },
          }),
        ],
      })),
    );
    this.router.get(
      '/',
      graphqlKoa((ctx: IKoaContext) => ({
        schema,
        context: new Context(ctx),
        validationRules: [
          depthLimit(10),
          costAnalysis({
            maximumCost: 750,
            defaultCost: 1,
            createError: (max, actual) => {
              const err = Error(
                `GraphQL query exceeds maximum complexity, (max: ${max}, actual: ${actual})`,
              );
              return err;
            },
          }),
        ],
      })),
    );
    if (process.env.IS_OFFLINE || process.env.STAGE === 'staging' || process.env.STAGE === 'test') {
      this.router.get(
        '/graphiql',
        graphiqlKoa({
          endpointURL: process.env.IS_OFFLINE ? '/api' : '/uplink/api',
        }),
      );
    }
  }
}

export const graphQlRouter = (): Router => new GraphQLRouter().getRouter();
