import * as React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// import Auth from './auth/Auth';
// import Landing from './pages/Landing/Landing';
import Navigation from './pages/components/Navigation';
import Routes from './Routes';

export const history = createBrowserHistory();

const App = () => (
  <Router history={history}>
      <Navigation />
      <Routes />
  </Router>
);

export default App;
