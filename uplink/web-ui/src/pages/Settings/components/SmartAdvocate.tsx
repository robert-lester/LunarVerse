import * as React from 'react';
import { connect } from 'react-redux';

import { GlobalState } from '../../../types';
import { getIntegrationSettingsData, saveSmartAdvocateSettings } from '../../../actions';
import { IntegrationSettings, IntegrationSettingsFlags } from '../../../apollo/types';
import Integration from './Integration';


interface MapDispatchToProps {
  getIntegrationSettings: () => void;
  saveSmartAdvocateSettings: (newSettings: IntegrationSettingsFlags) => void;
}

interface MapStateToProps {
  readonly isIntegrationSettingsLoading: boolean;
  readonly integrationSettings: IntegrationSettings | null;
}

type SmartAdvocateProps = MapDispatchToProps & MapStateToProps;

export class SmartAdvocate extends React.Component<SmartAdvocateProps> {

  componentDidMount() {
    this.props.getIntegrationSettings();
  }

  /** Handles save */
  handleSave = (variables: IntegrationSettingsFlags) => {
    this.props.saveSmartAdvocateSettings(variables);
  }

  render() {
    const { isIntegrationSettingsLoading, integrationSettings } = this.props;
    if (integrationSettings) {
      return (
        <Integration
          integrationTitle="SmartAdvocate Settings"
          integrationDescription="Manage settings for creating records within SmartAdvocate here."
          integrationToken={integrationSettings.integrationTokens.smartAdvocate.value}
          flags={integrationSettings.smartAdvocateIntegration.flags}
          pollingInterval={integrationSettings.smartAdvocateIntegration.pollingInterval}
          lastSuccessfulSync={integrationSettings.smartAdvocateIntegration.metadata.lastSuccessfulSync}
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
  saveSmartAdvocateSettings: (variables: IntegrationSettingsFlags) => saveSmartAdvocateSettings(variables)
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SmartAdvocate);
