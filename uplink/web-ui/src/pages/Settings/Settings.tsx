import * as React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, Switch, Route } from 'react-router';
import ReactGA from 'react-ga';

import './Settings.scss';
import { GlobalState } from '../../types';
import { getIntegrationSettingsData } from '../../actions';
import { IntegrationSettings } from '../../apollo/types';
import Plan from './components/Plan';
import Salesforce from './components/Salesforce';
import SmartAdvocate from './components/SmartAdvocate';
import Other from './components/Other';
import { Menu, IconNames, SubNavigationLink } from '../../components';


interface MapDispatchToProps {
  getIntegrationSettings: () => void;
}

interface MapStateToProps {
  readonly integrationSettings: IntegrationSettings | null;
}

type Props = RouteComponentProps & MapDispatchToProps & MapStateToProps;

export class Settings extends React.PureComponent<Props> {
  componentDidMount() {
    ReactGA.pageview(window.location.pathname);
    this.props.getIntegrationSettings();
  }

  render() {
    const { integrationSettings } = this.props;
    return (
      <div className="settings">
        <Menu icon={IconNames.SETTINGS} title="Settings">
          <SubNavigationLink to="/settings" label="Plan" />
          <SubNavigationLink to="/settings/salesforce" label="Integrations" disabled={true} />
          {integrationSettings ?
            <>
              <SubNavigationLink to="/settings/salesforce" label="Salesforce" isChild={true} disabled={integrationSettings.integrationTokens.salesforce.value ? false : true} />
              <SubNavigationLink to="/settings/smartadvocate" label="SmartAdvocate" isChild={true} disabled={integrationSettings.integrationTokens.smartAdvocate.value ? false : true} />
              <SubNavigationLink to="/settings/other" label="Other" isChild={true} disabled={integrationSettings.integrationTokens.genericCRM.value ? false : true} />
            </> : null
          }
        </Menu>
        <Switch>
          <Route path="/settings/other" component={Other} />
          <Route path="/settings/smartadvocate" component={SmartAdvocate} />
          <Route path="/settings/salesforce" component={Salesforce} />
          <Route component={Plan} />
        </Switch>
      </div>
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  integrationSettings: state.integrationSettings.payload,
});

const mapDispatchToProps = {
  getIntegrationSettings: () => getIntegrationSettingsData()
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings));