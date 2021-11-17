import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as integrationSettingsActions from '../integrationSettings';
import { IntegrationSettingsActionTypes } from '../integrationSettings';
import root from '../../reducers/root';

describe('Integration settings actions', () => {
  let mockStore: any;
  let store: MockStoreEnhanced;
  const integrationSettingsFlags = {
    syncCalls: false,
    syncRecords: false,
    syncMessages: false,
    __typname: "test"
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

  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set get of Integration settings data to error', () => {
    const expectedAction = {
      type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_ERROR
    }
    expect(integrationSettingsActions.saveIntegrationSettingsError()).toEqual(expectedAction)
  });

  it('should create an action to set getting of Integration settings data to loading', () => {
    const expectedAction = {
      type: IntegrationSettingsActionTypes.GET_INTEGRATION_SETTINGS_LOADING
    }
    expect(integrationSettingsActions.getIntegrationSettingsLoading()).toEqual(expectedAction)
  });

  it('should create an action to get Integration settings data', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getOrganization: {} } }));
    // @ts-ignore
    return store.dispatch(integrationSettingsActions.getIntegrationSettingsData()).then(() => {
      const expectedActions = [
        IntegrationSettingsActionTypes.GET_INTEGRATION_SETTINGS_LOADING,
        IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_SUCCESS
      ]
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should create an action to set saving of Saleforce settings to success', () => {
    const expectedAction = {
      type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_SUCCESS,
      payload: integrationSettings
    }
    expect(integrationSettingsActions.saveIntegrationSettingsSuccess(integrationSettings)).toEqual(expectedAction)
  });

  it('should create an action to set saving of Saleforce settings to error', () => {
    const expectedAction = {
      type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_ERROR
    }
    expect(integrationSettingsActions.saveIntegrationSettingsError()).toEqual(expectedAction)
  });

  it('should create an action to set saving of Saleforce settings to loading', () => {
    const expectedAction = {
      type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_LOADING
    }
    expect(integrationSettingsActions.saveIntegrationSettingsLoading()).toEqual(expectedAction)
  });

  it('should create an action to save Salesforce settings', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { updateOrganization: {} } }));
    // @ts-ignore
    return store.dispatch(integrationSettingsActions.saveSalesforceSettings()).then(() => {
      const expectedActions = [
        IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_LOADING,
        IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});