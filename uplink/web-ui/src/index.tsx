import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import ReactGA from 'react-ga';
import TagManager from 'react-gtm-module';
// This is a subsection of Babel Polyfill for cross platform compatibility. Handles Arrays, Objects, Promises, Strings, etc..
import 'core-js/stable/';
// This handles fetching for cross platform compatibility.
import 'whatwg-fetch';

import './styles/index.scss';
import App from './App';
import store from './reducers/root';
import client from './apollo/apolloClient';

const tagManagerArgs = {
  gtmId: 'GTM-NQNWF5J',
  auth: '1bzJTIxOCowL26xgnoJj7w',
  preview: 'env-2'
}

ReactGA.initialize('UA-140154106-1');
TagManager.initialize(tagManagerArgs);

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <App />
    </Provider>
  </ApolloProvider>,
  document.getElementById('root')
);
