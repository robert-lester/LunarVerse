import { Action } from 'redux';

import client from '../apollo/apolloClient';
import { PlanData, GetPlanData, GetUserNumberUsageData } from '../apollo/types';
import { getPlanQuery, getUserNumberUsage } from '../apollo/queries';
import { ThunkResult } from '../types';
import renderFeedback from '../apollo/feedback';
import { PlanMessaging } from '../constants/messaging';
import { NotificationType } from '../components';

export interface PlanAction extends Action {
  type: PlanActionTypes;
  payload?: PlanData | GetUserNumberUsageData | null;
}

export enum PlanActionTypes {
  GET_PLAN_DATA_ERROR = 'GET_PLAN_DATA_ERROR',
  GET_PLAN_DATA_LOADING = 'GET_PLAN_DATA_LOADING',
  GET_USAGE_DATA_ERROR = 'GET_USAGE_DATA_ERROR',
  SET_PLAN_DATA = 'SET_PLAN_DATA',
  SET_USAGE_DATA = 'SET_USAGE_DATA',
  GET_USAGE_DATA_LOADING = 'GET_USAGE_DATA_LOADING'
}

/** Set plan details */
export const setPlanData = (payload: PlanData): PlanAction => ({
  type: PlanActionTypes.SET_PLAN_DATA,
  payload
});

/** Get plan details error */
export const getPlanDataError = (): PlanAction => ({
  type: PlanActionTypes.GET_PLAN_DATA_ERROR
});

/** Get usage data error */
export const getUsageDataError = (): PlanAction => ({
  type: PlanActionTypes.GET_USAGE_DATA_ERROR
});

/** Set number usage details */
export const setUsageData = (payload: GetUserNumberUsageData): PlanAction => ({
  type: PlanActionTypes.SET_USAGE_DATA,
  payload
});

/** Get usage data loading state */
export const getPlanDataLoading = (): PlanAction => ({
  type: PlanActionTypes.GET_PLAN_DATA_LOADING
});

/** Get usage data loading state */
export const getUsageDataLoading = (): PlanAction => ({
  type: PlanActionTypes.GET_USAGE_DATA_LOADING
});

/** Get plan details */
export const getPlanData = (): ThunkResult<PlanData> => {
  return async (dispatch) => {
    dispatch(getPlanDataLoading());
    return client.query<GetPlanData>({
      query: getPlanQuery,
    }).then(
      ({ data }) =>
        dispatch(setPlanData(data.getPlan)),
      () => {
        dispatch(getPlanDataError());
        renderFeedback([{
          message: PlanMessaging.GET_PLAN_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Get User Number Usage */
export const getUsageData = (): ThunkResult<GetUserNumberUsageData> => {
  return async (dispatch) => {
    dispatch(getUsageDataLoading());
    return client.query<GetUserNumberUsageData>({
      query: getUserNumberUsage,
    }).then(
      ({ data }) => {
        dispatch(setUsageData(data))
      },
      () => {
        dispatch(getUsageDataError());
        renderFeedback([{
          message: PlanMessaging.GET_USAGE_DATA_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};