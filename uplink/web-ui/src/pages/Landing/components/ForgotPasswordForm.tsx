import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';

import { AuthData } from '../../../apollo/types';
import { Button, ButtonType, Input } from '../../../components';
import { GlobalState } from '../../../types';
import { sendResetPasswordEmail } from '../../../actions';

interface MapDispatchToProps {
  sendResetPasswordEmail: (authData: AuthData) => void;
}

interface MapStateToProps {
  readonly isAuthLoading: boolean;
}

type Props = MapStateToProps & MapDispatchToProps & RouteComponentProps;

interface State {
  orgSlug: string;
  email: string;
}

export class ForgotPasswordForm extends React.PureComponent<Props, State> {
  state = {
    orgSlug: '',
    email: ''
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
    this.props.sendResetPasswordEmail({ ...this.state, orgSlug });
    event.preventDefault();
  }

  /** Handles secondary action */
  handleSecondaryActionClick = () => {
    this.props.history.push('/');
  }

  render() {
    const isPrimaryActionDisabled = !!Object.keys(this.state).find(key => !this.state[key]);
    return (
      <form
        className="landing-form"
        onSubmit={this.handleSubmission}
      >
        <div className="__data">
          <h1 className="__title">Send an email to reset your password</h1>
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
            value={this.state.email || ''}
            className="__input"
            autoComplete="username"
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
              label="Send Reset Password Email"
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
  isAuthLoading: state.auth.isLoading,
});

const mapDispatchToProps: MapDispatchToProps = {
  sendResetPasswordEmail: (authData: AuthData) => sendResetPasswordEmail(authData),
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ForgotPasswordForm));