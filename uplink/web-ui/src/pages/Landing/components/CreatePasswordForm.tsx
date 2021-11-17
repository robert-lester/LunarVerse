import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { connect } from 'react-redux';

import './CreatePasswordForm.scss';
import { AuthData, URLToken } from '../../../apollo/types';
import { Button, ButtonType, Input, Loading } from '../../../components';
import { GlobalState } from '../../../types';
import { authenticateUser, verifyURLToken } from '../../../actions';
import { PasswordValidation, ValidationStatus } from './PasswordValidation';
import { testCapitalLetterCount, testCharacterCount, testNumberCount } from '../../../utils/inputValidation';

interface MapDispatchToProps {
  authenticateUser: (authData: AuthData) => void;
  verifyURLToken: (token: string) => void;
}

interface MapStateToProps {
  readonly isAuthLoading: boolean;
  readonly isURLTokenLoading: boolean;
  readonly urlTokenData: URLToken | null;
}

type Props = MapStateToProps & MapDispatchToProps & RouteComponentProps;

interface State {
  orgSlug: string;
  email: string;
  initialPassword: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export class CreatePasswordForm extends React.PureComponent<Props, State> {
  state = {
    confirmPassword: '',
    email: '',
    initialPassword: '',
    name: '',
    orgSlug: '',
    password: ''
  }

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    let token = params.get('token');
    if(token) {
      token = token.replace(/\s/g, '+');
      // Check token
      this.props.verifyURLToken(token);
      this.setState({ initialPassword: token });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Once we have received the URL token verification response
    if(prevProps.urlTokenData !== this.props.urlTokenData && this.props.urlTokenData) {
      this.setState({
        orgSlug: this.props.urlTokenData.orgSlug,
        email: this.props.urlTokenData.email,
        name: this.props.urlTokenData.name
      })
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
    const { confirmPassword, name, ...rest } = this.state;
    sessionStorage.setItem('uplinkOrgSlug', orgSlug);
    this.props.authenticateUser({ ...rest, orgSlug });
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
        className="landing-form create-password"
        onSubmit={this.handleSubmission}
      >
        {this.props.isURLTokenLoading && <Loading isGlobal={true} />}
        <div className="__data">
          <h1 className="__title">Welcome to Uplink</h1>
          <p className="__welcome-message">
            Welcome {this.state.name}. Please set a password for your login under the {this.state.orgSlug}. If you are not {this.state.email}
            &nbsp;<a href="https://www.belunar.com/resources/support/" target="_blank" className="__change-view-link">click here</a>.
          </p>
          <Input
            onChange={this.handleChange}
            label="Password"
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
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={this.state.confirmPassword}
            className="__input"
            autoComplete="new-password"
            validation={passwordMatchValidation}
          />
          <div className="__actions">
            <div></div>
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
  isAuthLoading: state.auth.isLoading,
  isURLTokenLoading: state.urlToken.isLoading,
  urlTokenData: state.urlToken.payload
});

const mapDispatchToProps: MapDispatchToProps = {
  authenticateUser: (authData: AuthData) => authenticateUser(authData),
  verifyURLToken: (urlToken: string) => verifyURLToken(urlToken)
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CreatePasswordForm));