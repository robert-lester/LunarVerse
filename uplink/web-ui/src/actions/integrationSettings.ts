import { Action } from 'redux';
import { ThunkResult } from '../types';
import client from '../apollo/apolloClient';

import renderFeedback from '../apollo/feedback';
import { NotificationType } from '../components';
import { IntegrationSettings, GetIntegrationSettingsData, UpdateIntegrationSettingsData, IntegrationSettingsFlags } from '../apollo/types';
import { getOrganizationQuery } from '../apollo/queries';
import { SalesforceSettingsMessaging, SmartAdvocateSettingsMessaging, GenericCRMSettingsMessaging } from '../constants/messaging';
import { updateIntegrationSettingsMutation } from '../apollo/mutations';

export interface IntegrationSettingsAction extends Action {
  type: IntegrationSettingsActionTypes;
  payload?: IntegrationSettings | null;
}

export enum IntegrationSettingsActionTypes {
  GET_INTEGRATION_SETTINGS_LOADING = 'GET_INTEGRATION_SETTINGS_LOADING',
  SAVE_INTEGRATION_SETTINGS = 'SAVE_INTEGRATION_SETTINGS',
  SAVE_INTEGRATION_SETTINGS_LOADING = 'SAVE_INTEGRATION_SETTINGS_LOADING',
  SAVE_INTEGRATION_SETTINGS_SUCCESS = 'SAVE_INTEGRATION_SETTINGS_SUCCESS',
  SAVE_INTEGRATION_SETTINGS_ERROR = 'SAVE_INTEGRATION_SETTINGS_ERROR'
}

/** Get Salesforce settings loading */
export const getIntegrationSettingsLoading = (): IntegrationSettingsAction => ({
  type: IntegrationSettingsActionTypes.GET_INTEGRATION_SETTINGS_LOADING
});

/** Save Salesforce settings loading */
export const saveIntegrationSettingsLoading = (): IntegrationSettingsAction => ({
  type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_LOADING
});

/** Save Salesforce settings success */
export const saveIntegrationSettingsSuccess = (payload: IntegrationSettings): IntegrationSettingsAction => ({
  type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_SUCCESS,
  payload
});

/** Save Salesforce settings error */
export const saveIntegrationSettingsError = (): IntegrationSettingsAction => ({
  type: IntegrationSettingsActionTypes.SAVE_INTEGRATION_SETTINGS_ERROR
});

/** Saves all Salesforce settings */
export const saveSalesforceSettings = (variables: IntegrationSettingsFlags): ThunkResult<IntegrationSettings> => {
  return async (dispatch, state) => {
    dispatch(saveIntegrationSettingsLoading());
    return client.mutate<UpdateIntegrationSettingsData>({
      mutation: updateIntegrationSettingsMutation,
      variables: {
        fields: {
          slug: sessionStorage.uplinkOrgSlug,
          uplinkSalesforceIntegration: {
            flags: variables
          }
        }
      }
    }).then(
      ({ data }) => {
        dispatch(saveIntegrationSettingsSuccess(data.updateOrganization));
        renderFeedback([{
          message: SalesforceSettingsMessaging.SAVE_SALESFORCE_SETTINGS_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      () => {
        dispatch(saveIntegrationSettingsError());
        renderFeedback([{
          message: SalesforceSettingsMessaging.SAVE_SALESFORCE_SETTINGS_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Saves all SmartAdvocate settings */
export const saveSmartAdvocateSettings = (variables: IntegrationSettingsFlags): ThunkResult<IntegrationSettings> => {
  return async (dispatch, state) => {
    dispatch(saveIntegrationSettingsLoading());
    return client.mutate<UpdateIntegrationSettingsData>({
      mutation: updateIntegrationSettingsMutation,
      variables: {
        fields: {
          slug: sessionStorage.uplinkOrgSlug,
          smartAdvocateIntegration: {
            flags: variables
          }
        }
      }
    }).then(
      ({ data }) => {
        dispatch(saveIntegrationSettingsSuccess(data.updateOrganization));
        renderFeedback([{
          message: SmartAdvocateSettingsMessaging.SAVE_SMARTADVOCATE_SETTINGS_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      () => {
        dispatch(saveIntegrationSettingsError());
        renderFeedback([{
          message: SmartAdvocateSettingsMessaging.SAVE_SALESFORCE_SETTINGS_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Saves all Generic CRM (Other) settings */
export const saveGenericCRMSettings = (variables: IntegrationSettingsFlags): ThunkResult<IntegrationSettings> => {
  return async (dispatch, state) => {
    dispatch(saveIntegrationSettingsLoading());
    return client.mutate<UpdateIntegrationSettingsData>({
      mutation: updateIntegrationSettingsMutation,
      variables: {
        fields: {
          slug: sessionStorage.uplinkOrgSlug,
          genericCRMIntegration: {
            flags: variables
          }
        }
      }
    }).then(
      ({ data }) => {
        dispatch(saveIntegrationSettingsSuccess(data.updateOrganization));
        renderFeedback([{
          message: GenericCRMSettingsMessaging.SAVE_GENERIC_CRM_SETTINGS_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      () => {
        dispatch(saveIntegrationSettingsError());
        renderFeedback([{
          message: GenericCRMSettingsMessaging.SAVE_GENERIC_CRM_SETTINGS_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Get Salesforce settings data */
export const getIntegrationSettingsData = (): ThunkResult<IntegrationSettings> => {
  return async (dispatch) => {
    dispatch(getIntegrationSettingsLoading());
    return client.query<GetIntegrationSettingsData>({
      query: getOrganizationQuery,
      variables: {
        slug: sessionStorage.uplinkOrgSlug
      }
    }).then(
      ({ data }) => {
        dispatch(saveIntegrationSettingsSuccess(data.getOrganization));
      },
      () => {
        dispatch(saveIntegrationSettingsError());
        renderFeedback([{
          message: SalesforceSettingsMessaging.GET_SALESFORCE_SETTINGS_DATA_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};