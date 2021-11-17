import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as planActions from '../plan';
import { PlanActionTypes } from "../plan";
import root from '../../reducers/root';

describe('Plan actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });
  it('should create an action to set plan data', () => {
    const payload = {
      sfToken: '',
      numbers: {
        used: 0,
        included: 0
      },
      usage: {
        smsMessages: 0,
        mmsMessages: 0,
        voiceMinutes: 0
      },
      usageCycle: {
        endDate: '',
        startDate: '',
      }
    };
    const expectedAction = {
      type: PlanActionTypes.SET_PLAN_DATA,
      payload
    };
    expect(planActions.setPlanData(payload)).toEqual(expectedAction)
  });

  it('should create an action to set getting plan data to error', () => {
    const expectedAction = {
      type: PlanActionTypes.GET_PLAN_DATA_ERROR
    }
    expect(planActions.getPlanDataError()).toEqual(expectedAction)
  });

  it('should create an action to set getting plan data to loading', () => {
    const expectedAction = {
      type: PlanActionTypes.GET_PLAN_DATA_LOADING
    }
    expect(planActions.getPlanDataLoading()).toEqual(expectedAction)
  });

  it('should create an action to set getting usage data to error', () => {
    const expectedAction = {
      type: PlanActionTypes.GET_USAGE_DATA_ERROR
    }
    expect(planActions.getUsageDataError()).toEqual(expectedAction)
  });

  it('should create an action to set usage data', () => {
    const payload = {
      getPlan: {
        numbers: {
          used: 0,
          included: 0
        }
      }
    };
    const expectedAction = {
      type: PlanActionTypes.SET_USAGE_DATA,
      payload
    };
    expect(planActions.setUsageData(payload)).toEqual(expectedAction)
  });

  it('should create an action to set getting usage data to loading', () => {
    const expectedAction = {
      type: PlanActionTypes.GET_USAGE_DATA_LOADING
    }
    expect(planActions.getUsageDataLoading()).toEqual(expectedAction)
  });

  it('should create an action to get plan data', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getPlan: {} } }));
    // @ts-ignore
    return store.dispatch(planActions.getPlanData()).then(() => {
      const expectedActions = [
        PlanActionTypes.GET_PLAN_DATA_LOADING,
        PlanActionTypes.SET_PLAN_DATA
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should create an action to get usage data', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getPlan: {} } }));
    // @ts-ignore
    return store.dispatch(planActions.getUsageData()).then(() => {
      const expectedActions = [
        PlanActionTypes.GET_USAGE_DATA_LOADING,
        PlanActionTypes.SET_USAGE_DATA
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});