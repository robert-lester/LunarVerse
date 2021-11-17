import integrationSettingsReducer, { integrationSettingsReducerInitialState } from '../integrationSettings';
import { IntegrationSettingsActionTypes } from '../../actions';

describe('Integration settings reducer', () => {
  const integrationSettingsFlags = {
    syncCalls: false,
    syncRecords: false,
    syncMessages: false,
    __typename: "test"
  }
  const integrationSettings = {
    integrationTokens: {
      salesforce: {
        value: "test"
      },
      smartAdvocate: {
        value: "test"
      },
      genericCRM: {
        value: "test"
      }
    },
    uplinkSalesforceIntegration: {
      flags: integrationSettingsFlags,
      metadata: {
        lastSuccessfulSync: 12345
      },
      pollingInterval: {
        increment: 15,
        unit: 'minutes'
      }
    },
    smartAdvocateIntegration: {
      flags: integrationSettingsFlags,
      metadata: {
        lastSuccessfulSync: 12345
      },
      pollingInterval: {
        increment: 15,
        unit: 'minutes'
      }
    },
    genericCRMIntegration: {
      flags: integrationSettingsFlags,
      metadata: {
        lastSuccessfulSync: 12345
      },
      pollingInterval: {
        increment: 15,
        unit: 'minutes'
      }
    },
  };

  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(integrationSettingsReducer(integrationSettingsReducerInitialState, {})).toEqual(integrationSettingsReducerInitialState)
  })

  it(`should handle ${IntegrationSettingsActionTypes.GET_INTEGRATION_SETTINGS_LOADING}`, () => {
    expect(integrationSettingsReducer(integrationSettingsReducerInitialState, {
      type: IntegrationSettingsActionTypes.GET_INTEGRATION_SETTINGS_LOADING
    })).toEqual(
      {
        ...integrationSettingsReducerInitialState,
        isGetIntegrationSettingsLoading: true
      }
    )
  })

  it(`should handle ${IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_LOADING}`, () => {
    expect(integrationSettingsReducer(integrationSettingsReducerInitialState, {
      type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_LOADING
    })).toEqual(
      {
        ...integrationSettingsReducerInitialState,
        isSaveIntegrationSettingsLoading: true
      }
    )
  })

  it(`should handle ${IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_ERROR}`, () => {
    expect(integrationSettingsReducer(integrationSettingsReducerInitialState, {
      type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_ERROR
    })).toEqual(
      {
        ...integrationSettingsReducerInitialState,
        isSaveIntegrationSettingsLoading: false
      }
    )
  })

  it(`should handle ${IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_SUCCESS}`, () => {
    expect(integrationSettingsReducer(integrationSettingsReducerInitialState, {
      type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_SUCCESS,
      payload: integrationSettings
    })).toEqual(
      {
        ...integrationSettingsReducerInitialState,
        payload: integrationSettings,
        isSaveIntegrationSettingsLoading: false
      }
    )
  })
});