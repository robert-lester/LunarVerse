import { GraphQLError } from 'graphql';

export class UplinkGraphQLException extends GraphQLError {
  code: string;

  constructor(message, ...args){
    super(message || 'There was an error processing the request', ...args);
  }
}