import { ApolloClient, FetchPolicy } from 'apollo-client';
import { ApolloLink, GraphQLRequest } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
// import { RestLink } from 'apollo-link-rest';
import { createHttpLink } from 'apollo-link-http';
import { onError, ErrorResponse } from 'apollo-link-error';
import { setContext } from 'apollo-link-context';

import renderFeedback from './feedback';
import { AuthenticationMessaging } from '../constants/messaging';
import { NotificationType } from '../components';
import { history } from '../App';

const cache = new InMemoryCache();
const httpLink = createHttpLink({ uri: process.env.REACT_APP_API_URL });
const defaultOptions = {
  query: {
    fetchPolicy: 'no-cache' as FetchPolicy
  }
};

/** Headers Link handler */
export const headersHandler = (_: GraphQLRequest, { headers }: any) => {
  // get the authentication token from local storage if it exists
  const token = sessionStorage.getItem('uplinkAuth');
  const sfAuthenticated = sessionStorage.getItem('uplinkAuthenticated');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: sfAuthenticated === 'true' ? `Basic ${token}` : token
    },
  };
};

/** Used for auth headers */
const headersLink = setContext(headersHandler);

/** Specific to login */
// const authLink = new RestLink({
//   uri: process.env.REACT_APP_CORE_URL,
//   headers: {
//     'content-type': 'application/json',
//   },
// });

/** Error Link handler */
export const errorhandler = ({ graphQLErrors, networkError }: ErrorResponse) => {
  // Workaround for catching 401's due to apollo bug, not futureproof
  if (networkError && networkError.toString().includes('Failed to fetch')) {
    const sfAuthenticated = sessionStorage.getItem('uplinkAuthenticated');
    !sfAuthenticated || sfAuthenticated === 'false';
    sessionStorage.clear();
    history.push('/');
    renderFeedback([{
      message: sfAuthenticated ? AuthenticationMessaging.AUTH_SF_ERROR : AuthenticationMessaging.AUTH_ERROR,
      type: NotificationType.ERROR
    }]);
  }
};

/** Catch errors globally */
export const errorLink = onError(errorhandler);

const link = ApolloLink.from([
  headersLink,
  // authLink,
  errorLink,
  httpLink
]);

const client = new ApolloClient({
  link,
  cache,
  defaultOptions
});

export default client;
