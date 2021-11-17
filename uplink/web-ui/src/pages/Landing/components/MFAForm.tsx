import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';

import { AuthData } from '../../../apollo/types';
import { Button, ButtonType, Input } from '../../../components';
import { GlobalState } from '../../../types';
import { authenticateUser, resendMFACode } from '../../../actions';

interface MapDispatchToProps {
  authenticateUser: (authData: AuthData) => void;
  resendMFACode: (authData: AuthData) => void;
}

interface MapStateToProps {
  readonly isAuthLoading: boolean;
}

type Props = MapStateToProps & MapDispatchToProps & RouteComponentProps;

interface State {
  orgSlug: string;
  email: string;
  password: string;
  code: string;
}

export class MFAForm extends React.PureComponent<Props, State> {
  state = {
    orgSlug: '',
    email: '',
    password: '',
    code: ''
  }

  componentDidMount() {
    // Set org if exists
    const params = new URLSearchParams(this.props.location.search);
    const orgSlug = params.get('org');
    if (orgSlug) {
      this.setState({ orgSlug });
    }
  }

  /** Handles input changes */
  handleChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Find this type
    // @ts-ignore
    this.setState({ [name]: value });
  }

  /** Handles form submission */
  handleSubmission = (event: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLFormElement>) => {
    const orgSlug = this.state.orgSlug.toLowerCase().replace(/\s/g, '-');
    sessionStorage.setItem('uplinkOrgSlug', orgSlug);
    this.props.authenticateUser({ ...this.state, orgSlug });
    event.preventDefault();
  }

  /** Handles secondary action */
  handleSecondaryActionClick = () => {
    const authData = {
      email: this.state.email,
      orgSlug: this.state.orgSlug.toLowerCase().replace(/\s/g, '-'),
      password: this.state.password,
    };
    this.props.resendMFACode(authData);
  }

  render() {
    const isPrimaryActionDisabled = !!Object.keys(this.state).find(key => !this.state[key]);
    return (
      <form
        className="landing-form"
        onSubmit={this.handleSubmission}
      >
        <div className="__data">
          <h1 className="__title">2-Step Verification</h1>
          <Input
            onChange={this.handleChange}
            label="Enter Code"
            name="code"
            type="text"
            value={this.state.code}
            className="__input"
          />
          <Input
            onChange={this.handleChange}
            label="Organization"
            name="orgSlug"
            type="text"
            value={this.state.orgSlug}
            className="__input"
          />
          <Input
            onChange={this.handleChange}
            label="Email Address"
            name="email"
            type="email"
            value={this.state.email}
            className="__input"
            autoComplete="username"
          />
          <Input
            onChange={this.handleChange}
            label="Password"
            name="password"
            type="password"
            value={this.state.password}
            className="__input"
            autoComplete="new-password"
          />
          <div className="__actions">
            <a
              className="__change-view-link"
              onClick={this.handleSecondaryActionClick}
            >
              Resend Code
            </a>
            <Button
              isLoading={this.props.isAuthLoading}
              label="Sign In"
              onClick={this.handleSubmission}
              className="__submission-button"
              disabled={isPrimaryActionDisabled}
              appearance={ButtonType.SECONDARY}
            />
          </div>
        </div>
      </form>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isAuthLoading: state.auth.isLoading
});

const mapDispatchToProps: MapDispatchToProps = {
  authenticateUser: (authData: AuthData) => authenticateUser(authData),
  resendMFACode: (authData: AuthData) => resendMFACode(authData)
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(MFAForm));