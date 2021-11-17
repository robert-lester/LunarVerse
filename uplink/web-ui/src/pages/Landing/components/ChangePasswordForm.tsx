import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';

import './ChangePasswordForm.scss';
import { AuthData } from '../../../apollo/types';
import { Button, ButtonType, Input } from '../../../components';
import { GlobalState } from '../../../types';
import { resetPassword } from '../../../actions';
import { PasswordValidation, ValidationStatus } from './PasswordValidation';
import { testCapitalLetterCount, testCharacterCount, testNumberCount } from '../../../utils/inputValidation';

interface MapDispatchToProps {
  resetPassword: (authData: AuthData) => void;
}

interface MapStateToProps {
  readonly isAuthLoading: boolean;
}

type Props = MapStateToProps & MapDispatchToProps & RouteComponentProps;

interface State {
  orgSlug: string;
  email: string;
  password: string;
  confirmPassword: string;
  confirmationCode: string;
}

export class ChangePasswordForm extends React.PureComponent<Props, State> {
  state = {
    orgSlug: '',
    email: '',
    password: '',
    confirmPassword: '',
    confirmationCode: ''
  }

  componentDidMount() {
    // Set org if exists
    const params = new URLSearchParams(this.props.location.search);
    const orgSlug = params.get('org');
    const confirmationCode = params.get('code');
    if (orgSlug && confirmationCode) {
      this.setState({ orgSlug, confirmationCode });
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
    this.props.resetPassword({ ...this.state, orgSlug });
    event.preventDefault();
  }

  /** Handles secondary action */
  handleSecondaryActionClick = () => {
    this.props.history.push('/');
  }

  /** Gets password match validation config for input */
  getPasswordMatchValidation = () => {
    if (this.state.password && this.state.confirmPassword) {
      const isPasswordMatching = this.state.password === this.state.confirmPassword;
      return {
        status: isPasswordMatching ? ValidationStatus.PASS : ValidationStatus.FAIL,
        message: isPasswordMatching ? 'Passwords match' : 'Passwords do not match'
      }
    }
  }

  /** Gets whether or not the form should be enabled */
  getPrimaryActionState = () => {
    return !!Object.keys(this.state).find(key => !this.state[key])
      || this.state.password !== this.state.confirmPassword
      || !testCapitalLetterCount(this.state.password)
      || !testCharacterCount(this.state.password)
      || !testNumberCount(this.state.password)
  }

  render() {
    const isPrimaryActionDisabled = this.getPrimaryActionState();
    const passwordMatchValidation = this.getPasswordMatchValidation();
    return (
      <form
        className="landing-form change-password"
        onSubmit={this.handleSubmission}
      >
        <div className="__data">
          <h1 className="__title">Reset Password</h1>
          <p className="__welcome-message">
            Please set a new password for your login under the {this.state.orgSlug}. If you are not in this organization then
            &nbsp;<a href="https://www.belunar.com/resources/support/" target="_blank" className="__change-view-link">click here</a>.
          </p>
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
            label="New Password"
            name="password"
            type="password"
            value={this.state.password}
            className="__input"
            autoComplete="new-password"
            validation={passwordMatchValidation}
          />
          <PasswordValidation value={this.state.password} />
          <Input
            onChange={this.handleChange}
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={this.state.confirmPassword}
            className="__input"
            autoComplete="new-password"
            validation={passwordMatchValidation}
          />
          <div className="__actions">
            <a
              className="__change-view-link"
              onClick={this.handleSecondaryActionClick}
            >
              Back to Sign In
            </a>
            <Button
              isLoading={this.props.isAuthLoading}
              label="Confirm and Sign In"
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
  resetPassword: (authData: AuthData) => resetPassword(authData)
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ChangePasswordForm));