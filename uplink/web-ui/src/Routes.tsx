import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { withRouter } from 'react-router';

import { Layout } from './pages/components';
import { Loading } from './components';

const Activity = React.lazy(() => import('./pages/Activity/Activity'));
const AssignNumbers = React.lazy(() => import('./pages/AssignNumbers/AssignNumbers'));
const Messages = React.lazy(() => import('./pages/Messages/Messages'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));
const Plan = React.lazy(() => import('./pages/Settings/components/Plan'));
const Error = React.lazy(() => import('./pages/Error/Error'));

export const Routes = () => (
  <React.Suspense fallback={<Loading isGlobal={true} />}>
    <Layout>
      <Switch>
        <Route exact={true} path="/activity" component={Activity} />
        <Route exact={true} path="/assign" component={AssignNumbers} />
        <Route path="/messages" component={Messages} />
        <Route path="/settings" component={Settings} />
        <Route path="/plan" component={Plan} />
        <Route component={Error} />
      </Switch>
    </Layout>
  </React.Suspense>
);

export default withRouter(Routes);
