import * as React from 'react';
import { connect } from 'react-redux';

import './SalesforceOverview.scss';
import Info from './pages/Info/Info';
import Messages from './pages/Messages/Messages';
import ModulePhoneNumberCheck from '../components/ModulePhoneNumberCheck';
import { Tabs } from '../../../components';
import { getUserData, getActivityData } from '../../../actions';

interface MapDispatchToProps {
  getUserData: () => void;
  getActivityData: () => void;
}

interface State {
  tab: number;
}

type Props = MapDispatchToProps;

const initialState = {
  tab: 0
};

export class SalesforceOverview extends React.Component<Props, State> {
  state: State = initialState;

  componentDidMount() {
    // Get user info for start conversation button and info screen
    // since both tabs rely on this call
    if (this.isMobileNumberPresent()) {
      this.props.getUserData();
      this.props.getActivityData();
    }
  }

  /** Toggles the tab based on the selection */
  toggleTab = (tab: number) => {
    this.setState({ tab }, () => this.props.getActivityData());
  }

  /** Render component based on selected tab */
  renderTab = () => {
    let component = <Messages isSalesforce={true} />;
    if (this.state.tab) {
      component = <Info/>
    }
    return (
      <ModulePhoneNumberCheck>
        {component}
      </ModulePhoneNumberCheck>
    );
  }

  /** Checks to see if a mobile phone number is present in custom settings */
  isMobileNumberPresent = (): boolean => {
    const uplinkContactPhoneNumber = sessionStorage.getItem('uplinkContactPhoneNumber');
    return !!(uplinkContactPhoneNumber && uplinkContactPhoneNumber !== 'undefined');
  }

  render() {
    // If no mobile phone number is present, show messaging
    if(!this.isMobileNumberPresent()) {
      return (
        <div className="sf-default-message sf-uplink">
          <h3>Please enter a phone number in the "Mobile" field to begin using Uplink for this record.</h3>
        </div>
      );
    }
    return (
      <div className="sf-overview">
        <div className="__header">
          <Tabs
            onClick={this.toggleTab}
            options={['Messages', 'Info']}
            selected={this.state.tab}
          />
        </div>
        {this.renderTab()}
      </div>
    );
  }
}

export const mapDispatchToProps = {
  getUserData: () => getUserData(),
  getActivityData: () => getActivityData()
};

export default connect(null, mapDispatchToProps)(SalesforceOverview);