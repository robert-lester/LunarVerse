import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as activityActions from '../activity';
import root from '../../reducers/root';
import { ActivityActionTypes } from '../activity';
import { createNotificationElement, chartDataMock, userNumberMock } from '../../utils/mocks';

describe('Activity actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
    createNotificationElement();
  });

  afterEach(() => {
    store.clearActions();
  });
  it('should create an action to set activity selected number', () => {
    const expectedAction = {
      type: ActivityActionTypes.SET_SELECTED_NUMBER,
      payload: userNumberMock
    }
    expect(activityActions.setActivitySelectedNumber(userNumberMock)).toEqual(expectedAction)
  });

  it('should create an action to clear selected numbers', () => {
    expect(activityActions.clearActivitySelectedNumbers().type).toEqual(ActivityActionTypes.CLEAR_SELECTED_NUMBERS)
  });

  it('should dispatch actions for get chart data success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getUsage: {} } }));
    // @ts-ignore
    return store.dispatch(activityActions.getChartData()).then(() => {
      const expectedActions = [
        ActivityActionTypes.GET_CHART_DATA_LOADING,
        ActivityActionTypes.SET_CHART_DATA
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for get chart data error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getUsage: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(activityActions.getChartData()).then(() => {
      const expectedActions = [
        ActivityActionTypes.GET_CHART_DATA_LOADING,
        ActivityActionTypes.GET_CHART_DATA_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should create an action to show chart loading state', () => {
    expect(activityActions.getChartDataLoading().type).toEqual(ActivityActionTypes.GET_CHART_DATA_LOADING)
  });

  it('should create an action to show chart data error', () => {
    expect(activityActions.getChartDataError().type).toEqual(ActivityActionTypes.GET_CHART_DATA_ERROR)
  });

  it('should create an action to set chart data', () => {
    const expectedAction = {
      type: ActivityActionTypes.SET_CHART_DATA,
      payload: chartDataMock
    }
    expect(activityActions.setChartData(chartDataMock)).toEqual(expectedAction)
  });

  it('should dispatch actions for get activity data success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getActivity: {} } }));
    // @ts-ignore
    return store.dispatch(activityActions.getActivityData()).then(() => {
      const expectedActions = [
        ActivityActionTypes.GET_ACTIVITY_DATA_LOADING,
        ActivityActionTypes.SET_ACTIVITY_DATA
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for get activity data error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getActivity: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(activityActions.getActivityData()).then(() => {
      const expectedActions = [
        ActivityActionTypes.GET_ACTIVITY_DATA_LOADING,
        ActivityActionTypes.GET_ACTIVITY_DATA_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should create an action to show activity data error', () => {
    expect(activityActions.getActivityDataError().type).toEqual(ActivityActionTypes.GET_ACTIVITY_DATA_ERROR)
  });

  it('should create an action to show activity loading state', () => {
    expect(activityActions.getActivityDataLoading().type).toEqual(ActivityActionTypes.GET_ACTIVITY_DATA_LOADING)
  });
});