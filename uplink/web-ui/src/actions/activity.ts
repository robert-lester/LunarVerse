import { Action } from 'redux';
import { Usage, UserNumber, Activity } from '../apollo/types';
import { ThunkResult, ChartType, MessageType } from '../types';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { ActivityMessaging } from '../constants/messaging';
import { MonthYear } from '../components/MonthPicker/MonthPicker';
import { NotificationType } from '../components';
import { getUsageQuery, getActivityQuery } from '../apollo/queries';

export interface ActivityAction extends Action {
  type: ActivityActionTypes;
  payload?: Activity | Usage | MonthYear | UserNumber | string | null;
}

export enum ActivityActionTypes {
  SET_CHART_DATA = 'SET_CHART_DATA',
  GET_CHART_DATA_LOADING = 'GET_CHART_DATA_LOADING',
  GET_CHART_DATA_ERROR = 'GET_CHART_DATA_ERROR',
  SET_CHART_TYPE = 'SET_CHART_TYPE',
  SET_ACTIVITY_DATE_RANGE = 'SET_ACTIVITY_DATE_RANGE',
  SET_MESSAGE_TYPE = 'SET_MESSAGE_TYPE',
  SET_SELECTED_NUMBER = 'SET_SELECTED_NUMBER',
  CLEAR_SELECTED_NUMBERS = 'CLEAR_SELECTED_NUMBERS',
  GET_ACTIVITY_DATA_LOADING = 'GET_ACTIVITY_DATA_LOADING',
  GET_ACTIVITY_DATA_ERROR = 'GET_ACTIVITY_DATA_ERROR',
  SET_ACTIVITY_DATA = 'SET_ACTIVITY_DATA'
}

/** Set selected numbers */
export const setActivitySelectedNumber = (payload: UserNumber): ActivityAction => ({
  type: ActivityActionTypes.SET_SELECTED_NUMBER,
  payload
});

/** Clear selected numbers */
export const clearActivitySelectedNumbers = (): ActivityAction => ({
  type: ActivityActionTypes.CLEAR_SELECTED_NUMBERS
});

/** Get chart data loading state */
export const getChartDataLoading = (): ActivityAction => ({
  type: ActivityActionTypes.GET_CHART_DATA_LOADING
});

/** Get chart data error */
export const getChartDataError = (): ActivityAction => ({
  type: ActivityActionTypes.GET_CHART_DATA_ERROR
});

/** Set chart data */
export const setChartData = (payload: Usage): ActivityAction => ({
  type: ActivityActionTypes.SET_CHART_DATA,
  payload
});

/** Set activity data */
export const setActivityData = (payload: Activity): ActivityAction => ({
  type: ActivityActionTypes.SET_ACTIVITY_DATA,
  payload
});

/** Get activity data error */
export const getActivityDataError = (): ActivityAction => ({
  type: ActivityActionTypes.GET_ACTIVITY_DATA_ERROR
});

/** Get activity data loading state */
export const getActivityDataLoading = (): ActivityAction => ({
  type: ActivityActionTypes.GET_ACTIVITY_DATA_LOADING
});

/** Get chart data */
export const getChartData = (): ThunkResult<Usage> => {
  return async (dispatch, state) => {
    dispatch(getChartDataLoading());
    const phoneNumbers = state().activity.selectedUserNumbers.map(({ systemNumber }) => systemNumber);
    return client.query({
      query: getUsageQuery,
      variables: {
        dateRange: state().activity.dateRange,
        phoneNumbers
      }
    }).then(
      ({ data }) => {
        dispatch(setChartData(data.getUsage))
      },
      () => {
        dispatch(getChartDataError());
        renderFeedback([{
          message: ActivityMessaging.GET_CHART_DATA_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Get activity data */
export const getActivityData = (): ThunkResult<Activity> => {
  return async (dispatch) => {
    dispatch(getActivityDataLoading());
    return client.query({
      query: getActivityQuery,
      variables: {
        phoneNumber: sessionStorage.getItem('uplinkContactPhoneNumber')
      }
    }).then(
      ({ data }) => {
        dispatch(setActivityData(data.getActivity));
      },
      () => {
        dispatch(getActivityDataError());
        renderFeedback([{
          message: ActivityMessaging.GET_ACTIVITY_DATA_ERROR,
          type: NotificationType.ERROR
        }]);
    });
  };
};

/** Set date range */
export const setActivityDateRange = (payload: MonthYear): ActivityAction => ({
  type: ActivityActionTypes.SET_ACTIVITY_DATE_RANGE,
  payload
});

/** Set chart type */
export const setChartType = (payload: ChartType): ActivityAction => ({
  type: ActivityActionTypes.SET_CHART_TYPE,
  payload
});

/** Set message type */
export const setMessageType = (payload: MessageType): ActivityAction => ({
  type: ActivityActionTypes.SET_MESSAGE_TYPE,
  payload
});