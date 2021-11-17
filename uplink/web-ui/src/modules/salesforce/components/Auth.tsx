import * as React from 'react';

import './Auth.scss';
import { Card } from '../../../components';

interface Props {
  children: any;
}

export class Auth extends React.PureComponent<Props> {
  render() {
    const isAuthenticated = sessionStorage.getItem('uplinkAuthenticated') === 'true';
    if (isAuthenticated) {
      return (
        <div className="sf-uplink">
          {this.props.children}
        </div>
      );
    }
    return (
      <div className="sf-auth sf-uplink">
        <Card className="sf-auth__message">
          Please configure your settings for Uplink in the custom settings page.
        </Card>
      </div>
    );
  }
}
