import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';

import { AuthData } from '../../../apollo/types';
import { Button, ButtonType, Input } from '../../../components';
import { GlobalState } from '../../../types';
import { registerPhoneNumber } from '../../../actions';

interface MapDispatchToProps {
  registerPhoneNumber: (authData: AuthData) => void;
}

interface MapStateToProps {
  readonly isAuthLoading: boolean;
}

type Props = MapStateToProps & MapDispatchToProps & RouteComponentProps;

interface State {
  orgSlug: string;
  email: string;
  password: string;
  phone: string;
}

export class RegisterPhoneNumberForm extends React.PureComponent<Props, State> {
  state = {
    orgSlug: '',
    email: '',
    password: '',
    phone: ''
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
    this.props.registerPhoneNumber({ ...this.state, orgSlug });
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
          <h1 className="__title">Register Phone Number</h1>
          <Input
            onChange={this.handleChange}
            label="Phone Number"
            name="phone"
            type="text"
            value={this.state.phone}
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
              label="Next"
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
  registerPhoneNumber: (authData: AuthData) => registerPhoneNumber(authData)
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RegisterPhoneNumberForm));