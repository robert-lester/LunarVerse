import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { connect } from 'react-redux';

import { GlobalState } from '../types';
import { Timeout, Loading } from '../components';
import { signOut, refreshAuthToken, authenticateUserSuccess } from '../actions';

interface Props {
  login: any;
}

interface MapDispatchToProps {
  signOut: () => void;
  refreshAuthToken: () => void;
  authenticateUserSuccess: () => void;
}

interface MapStateToProps {
  readonly isAuthenticated: boolean | null;
  readonly authToken: string | null;
}

interface State {
  isTimeoutVisible: boolean;
}

type AuthProps = Props & MapStateToProps & MapDispatchToProps & RouteComponentProps;

const initialState: State = {
  isTimeoutVisible: false
};

export class Auth extends React.Component<AuthProps, State> {
  state = initialState;
  // Session storage keys
  STORAGE_USER_KEY: string = 'lunarUser';
  STORAGE_EXPIRES_KEY: string = 'lunarAuthExpiration';
  // 8 minute timeout
  ACTIVITY_TIMEOUT: number = 480000;
  // 9 minutes
  POPUP_TIMEOUT: number = 540000;
  // 10 minute TTL
  TOKEN_TTL: number = 600000;
  // User's last activity
  userActivityTime: number = new Date().getTime();
  activityInterval: number = 0;
  activityTimerStart: number = 0;

  componentDidMount() {
    // Checks to see if user is already logged in to start the activity timer
    if (this.isTokenAlive()) {
      this.props.authenticateUserSuccess();
      this.refreshToken();
    }
  }

  componentDidUpdate(prevProps: AuthProps) {
    // If user is logged in
    if (this.props.isAuthenticated && !prevProps.isAuthenticated) {
      this.updateAuthState();
      this.addMouseMoveEventListener();
      // If user is authenticated, redirect where appropriate
      if (this.props.history.location.pathname !== '/') {
        this.props.history.push(this.props.history.location.pathname);
      } else {
        this.props.history.push('/messages');
      }
    } else if (!this.props.isAuthenticated && prevProps.isAuthenticated) {
      clearInterval(this.activityInterval);
      this.setState({ isTimeoutVisible: false });
    }
    // Token has been refreshed
    if (this.props.authToken !== prevProps.authToken && this.props.authToken) {
      this.updateAuthState();
    }
  }

  /** Listens for user mousemove */
  addMouseMoveEventListener() {
    // Check for user activity
    document.addEventListener('mousemove', () => {
      this.setUserActivityTime();
    });
  }

  /** Checks against the token TTL to ensure user is still
   * logged in or not.
   */
  isTokenAlive = () =>
    Number(sessionStorage[this.STORAGE_EXPIRES_KEY]) - new Date().getTime() < this.TOKEN_TTL

  /** Updates session storage token expiration time. */
  setStorageExpiration = () => {
    sessionStorage[this.STORAGE_EXPIRES_KEY] = new Date().getTime() + this.TOKEN_TTL;
  }

  /** Handles mouse activity to update the user's last activity time. */
  setUserActivityTime = () => {
    this.userActivityTime = new Date().getTime();
  }

  /** Handles token refresh. */
  refreshToken = () => {
    this.props.refreshAuthToken();
  }

  /** Checks activity based on time */
  checkActivity = () => {
    const now = new Date().getTime();
    // Check for any activity before 8 minutes
    if (
      (now - this.activityTimerStart) >= this.ACTIVITY_TIMEOUT &&
      (now - this.userActivityTime) < this.ACTIVITY_TIMEOUT
    ) {
      this.props.refreshAuthToken();
    } else {
      // Timeout popup show
      if (
        (now - this.userActivityTime) > this.POPUP_TIMEOUT &&
        !this.state.isTimeoutVisible
      ) {
        this.setState({ isTimeoutVisible: true });
      }
      // Auto logout
      if (now - this.activityTimerStart > this.TOKEN_TTL) {
        this.setState({ isTimeoutVisible: false });
        this.props.signOut();
      }
    }
  }

  /** Starts the activity timer for timeouts */
  startActivityTimer = () => {
    clearInterval(this.activityInterval);
    this.activityTimerStart = new Date().getTime();
    this.activityInterval = window.setInterval(this.checkActivity.bind(this), 1000);
  }

  /** Update auth app state */
  updateAuthState = () => {
    this.userActivityTime = new Date().getTime();
    this.setStorageExpiration();
    this.startActivityTimer();
  }

  /** Toggles the timeout modal */
  toggleTimeout = () => {
    this.setState({ isTimeoutVisible: !this.state.isTimeoutVisible });
  }

  render() {
    const { login: Login, isAuthenticated } = this.props;
    const { isTimeoutVisible } = this.state;
    if (isAuthenticated) {
      // Authenticated based on existing token in sessionStorage, but not valid token yet
      if (!this.props.authToken) {
        return <Loading isGlobal={true} />;
      }
      return (
        <>
          {isTimeoutVisible
            && <Timeout
              onToggle={this.toggleTimeout}
              onLogout={() => this.props.signOut()}
              performActivity={this.setUserActivityTime}
              refreshToken={this.refreshToken}
            />}
          {this.props.children}
        </>
      );
    }
    return <Login />;
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthenticated: state.auth.payload,
  authToken: state.authToken.payload
})

const mapDispatchToProps: MapDispatchToProps = {
  refreshAuthToken: () => refreshAuthToken(),
  authenticateUserSuccess: () => authenticateUserSuccess(),
  signOut: () => signOut()
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Auth));
