import * as React from 'react';
import { connect } from 'react-redux';

import { GlobalState } from '../../../types';
import { getIntegrationSettingsData, saveGenericCRMSettings } from '../../../actions';
import { IntegrationSettings, IntegrationSettingsFlags } from '../../../apollo/types';
import Integration from './Integration';


interface MapDispatchToProps {
  getIntegrationSettings: () => void;
  saveGenericCRMSettings: (newSettings: IntegrationSettingsFlags) => void;
}

interface MapStateToProps {
  readonly isIntegrationSettingsLoading: boolean;
  readonly integrationSettings: IntegrationSettings | null;
}

type GenericCRMProps = MapDispatchToProps & MapStateToProps;

export class GenericCRM extends React.Component<GenericCRMProps> {

  componentDidMount() {
    this.props.getIntegrationSettings();
  }

  /** Handles save */
  handleSave = (variables: IntegrationSettingsFlags) => {
    this.props.saveGenericCRMSettings(variables);
  }

  render() {
    const { isIntegrationSettingsLoading, integrationSettings } = this.props;
    if (integrationSettings) {
      return (
        <Integration
          integrationTitle="Generic CRM Settings"
          integrationDescription="Manage settings for creating activities within a CRM here."
          integrationToken={integrationSettings.integrationTokens.genericCRM.value}
          flags={integrationSettings.genericCRMIntegration.flags}
          pollingInterval={integrationSettings.genericCRMIntegration.pollingInterval}
          lastSuccessfulSync={integrationSettings.genericCRMIntegration.metadata.lastSuccessfulSync}
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
  saveGenericCRMSettings: (variables: IntegrationSettingsFlags) => saveGenericCRMSettings(variables)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GenericCRM);