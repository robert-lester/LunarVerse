import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';

import '../../../styles/index.scss';
import SalesforceConversation from './SalesforceConversation';
import client from '../../../apollo/apolloClient';
import store from '../../../reducers/root';
import { Auth } from '../components/Auth';

ReactDOM.render(
  <ApolloProvider client={client}>
    <Provider store={store}>
      <Auth>
        <SalesforceConversation />
      </Auth>
    </Provider>
  </ApolloProvider>,
  document.getElementById('uplink-salesforce-conversation')
);