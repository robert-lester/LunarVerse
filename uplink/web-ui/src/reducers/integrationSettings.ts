import { IntegrationSettingsAction, IntegrationSettingsActionTypes } from '../actions';
import { IntegrationSettings } from '../apollo/types';

export interface IntegrationSettingsState {
  readonly isGetIntegrationSettingsLoading: boolean;
  readonly isSaveIntegrationSettingsLoading: boolean;
  readonly payload: IntegrationSettings | null;
}

export const integrationSettingsReducerInitialState: IntegrationSettingsState = {
  isGetIntegrationSettingsLoading: false,
  isSaveIntegrationSettingsLoading: true,
  payload: null
}

const integrationSettings = (
  state = integrationSettingsReducerInitialState,
  action: IntegrationSettingsAction
) => {
  switch (action.type) {
    case IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_SUCCESS:
      return {
        ...state,
        payload: action.payload,
        isSaveIntegrationSettingsLoading: false,
        isGetIntegrationSettingsLoading: false
      };
    case IntegrationSettingsActionTypes.GET_INTEGRATION_SETTINGS_LOADING:
      return {
        ...state,
        isGetIntegrationSettingsLoading: true
      };
    case IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_LOADING:
      return {
        ...state,
        isSaveIntegrationSettingsLoading: true
      };
    case IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_ERROR:
      return {
        ...state,
        isSaveIntegrationSettingsLoading: false,
        isGetIntegrationSettingsLoading: false
      };
    default:
      return state;
  }
};

export default integrationSettings;