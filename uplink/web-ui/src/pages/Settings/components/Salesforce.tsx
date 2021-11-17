import * as React from 'react';
import { connect } from 'react-redux';

import { GlobalState } from '../../../types';
import { getIntegrationSettingsData, saveSalesforceSettings } from '../../../actions';
import { IntegrationSettings, IntegrationSettingsFlags } from '../../../apollo/types';
import Integration from './Integration';


interface MapDispatchToProps {
  getIntegrationSettings: () => void;
  saveSalesforceSettings: (newSettings: IntegrationSettingsFlags) => void;
}

interface MapStateToProps {
  readonly isIntegrationSettingsLoading: boolean;
  readonly integrationSettings: IntegrationSettings | null;
}

type SalesforceProps = MapDispatchToProps & MapStateToProps;

export class Salesforce extends React.Component<SalesforceProps> {

  componentDidMount() {
    this.props.getIntegrationSettings();
  }

  /** Handles save */
  handleSave = (variables: IntegrationSettingsFlags) => {
    this.props.saveSalesforceSettings(variables);
  }

  render() {
    const { isIntegrationSettingsLoading, integrationSettings } = this.props;
    if (integrationSettings) {
      return(
        <Integration
          integrationTitle="Salesforce Activity Settings"
          integrationDescription="Manage settings for creating activities within Salesforce here."
          integrationToken={integrationSettings.integrationTokens.salesforce.value}
          flags={integrationSettings.uplinkSalesforceIntegration.flags}
          pollingInterval={integrationSettings.uplinkSalesforceIntegration.pollingInterval}
          lastSuccessfulSync={integrationSettings.uplinkSalesforceIntegration.metadata.lastSuccessfulSync}
          isIntegrationLoading={isIntegrationSettingsLoading}
          saveIntegrationSettings={this.handleSave}
        />
      )
    }
    return null;
  }
}

const mapStateToProps = (state: GlobalState) => ({
  integrationSettings: state.integrationSettings.payload,
  isIntegrationSettingsLoading: (state.integrationSettings.isGetIntegrationSettingsLoading || state.integrationSettings.isSaveIntegrationSettingsLoading),
});

const mapDispatchToProps = {
  getIntegrationSettings: () => getIntegrationSettingsData(),
  saveSalesforceSettings: (variables: IntegrationSettingsFlags) => saveSalesforceSettings(variables)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Salesforce);