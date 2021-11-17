import { makeExecutableSchema, addSchemaLevelResolveFunction } from 'graphql-tools';
import { mergeObj } from '../lib/mapping';
import { isAuthedResolver as requiredAuth } from '../lib/authorization';
import scalars from './types/scalars';
import Conversation from './types/conversation';
import Message from './types/message';
import Node from './types/node';
import Organization from './types/organization';
import PhoneNumber from './types/phoneNumber';
import Plan from './types/plan';
import Usage from './types/usage';
import User from './types/user';
import Media from './types/media';

import conversationQueries from './queries/conversation';
import messageQueries from './queries/message';
import organizationQueries from './queries/organization';
import phoneNumberQueries from './queries/phoneNumber';
import planQueries from './queries/plan';
import usageQueries from './queries/usage';
import userQueries from './queries/user';

import organizationMutations from './mutations/organization';
import phoneNumberMutations from './mutations/phoneNumber';
import userMutations from './mutations/user';
import messageMutations from './mutations/messages';

const Root = /* GraphQL */ `
	# The dummy queries and mutations are necessary because
	# graphql-js cannot have empty root types and we only extend
	# these types later on
	# Ref: apollographql/graphql-tools#293
	type Query {
		dummy: String
	}
	type Mutation {
		dummy: String
	}
	schema {
		query: Query
		mutation: Mutation
	}
`;

const resolvers = mergeObj(
  {},
  // Queries
  scalars.resolvers,
  conversationQueries,
  messageQueries,
  organizationQueries,
  phoneNumberQueries,
  planQueries,
  usageQueries,
  userQueries,
  // Mutations
  organizationMutations,
  phoneNumberMutations,
  userMutations,
  messageMutations,
);

// Integrate authorization with schema queries and mutations
const Query = Object.keys(resolvers.Query).reduce((prev, curr) => {
  prev[curr] = requiredAuth(resolvers.Query[curr]);
  return prev;
}, {});
const Mutation = Object.keys(resolvers.Mutation).reduce((prev, curr) => {
  prev[curr] = requiredAuth(resolvers.Mutation[curr]);
  return prev;
}, {});

const resolversWithAuth = Object.assign({}, resolvers, { Query, Mutation });

const schema = makeExecutableSchema({
  typeDefs: [
    scalars.typeDefs,
    Root,
    Conversation,
    Message,
    Node,
    Organization,
    PhoneNumber,
    Plan,
    Usage,
    User,
    Media,
  ],
  resolvers: resolversWithAuth,
});

if (process.env.MAINTENANCE_MODE === 'enabled') {
  console.error('\n\n⚠️ ----MAINTENANCE MODE ENABLED----⚠️\n\n');
  addSchemaLevelResolveFunction(schema, () => {
    throw new Error('Maintenance mode');
  });
}

export default schema;
