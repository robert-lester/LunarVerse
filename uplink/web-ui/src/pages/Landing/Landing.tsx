import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import './Landing.scss';
import ChangePasswordForm from './components/ChangePasswordForm';
import CreatePasswordForm from './components/CreatePasswordForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import LoginForm from './components/LoginForm';
import Logo from '../../img/Logo';
import Lunar from '../../img/Lunar';
import MFAForm from './components/MFAForm';
import RegisterPhoneNumberForm from './components/RegisterPhoneNumberForm';
import { Layout } from '../components';

interface MapStateToProps {
  isLoading: boolean;
}
type Props = RouteComponentProps & MapStateToProps;

export class Landing extends React.Component<Props> {
  /** Renders the appropriate form */
  renderForm = () => {
    const params = new URLSearchParams(this.props.location.search);
    const formType = params.get('type');
    const formComponents = {
      forgotPassword: ForgotPasswordForm,
      newUser: CreatePasswordForm,
      confirmPassword: ChangePasswordForm,
      multiFactorAuth: MFAForm,
      registerPhoneNumber: RegisterPhoneNumberForm
    };
    const formComponent = formComponents[formType as string];
    const Form = formType && formComponent ? formComponent : LoginForm;
    return <Form />;
  }
  render() {
    return (
      <Layout>
        <div className="landing">
          <div className="__left-wrap">
            <div className="__logo-wrap">
              <div className="__logo">
                {Logo()}
              </div>
            </div>
            <div className="__contact" >
              <div className="__lunar" >
                {Lunar()}
              </div>
              <div className="__contact-container">
                <div className="__contact-container-group" >
                  <p>Need help?</p>
                  <a
                    className="__contact-container-link"
                    href="https://www.belunar.com/resources/support/"
                    target="new"
                  >
                    Contact Support
              </a>
                </div>
                <div className="__contact-container-group">
                  <p>Need an account?</p>
                  <a
                    className="__contact-container-link"
                    href="http://www.belunar.com/company/contact"
                    target="new"
                  >
                    Learn More
              </a>
                </div>
              </div>
              <div className="__contact-container-group">
                <a
                  className="__contact-container-link"
                  href="https://www.belunar.com/terms-of-service/"
                  target="new"
                >
                  Terms of Service
            </a>
              </div>
            </div>
          </div>
          {this.renderForm()}
        </div>
      </Layout>
    );
  }
}

export default withRouter(Landing);
