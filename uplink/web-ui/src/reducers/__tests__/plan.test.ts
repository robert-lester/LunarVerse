import planReducer, { planReducerInitialState } from '../plan';
import { PlanActionTypes } from '../../actions';

describe('plan reducer', () => {
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(planReducer(planReducerInitialState, {})).toEqual(planReducerInitialState)
  })

  it(`should handle ${PlanActionTypes.SET_PLAN_DATA}`, () => {
    const planData = {
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
    expect(
      planReducer(planReducerInitialState, {
        type: PlanActionTypes.SET_PLAN_DATA,
        payload: planData
      })
    ).toEqual(
      {
        ...planReducerInitialState,
        isGetPlanDataLoading: false,
        payload: planData
      }
    );
  })

  it(`should handle ${PlanActionTypes.SET_USAGE_DATA}`, () => {
    expect(
      planReducer(planReducerInitialState, {
        type: PlanActionTypes.SET_USAGE_DATA,
        payload: null
      })
    ).toEqual(
      {
        ...planReducerInitialState,
        isGetUsageDataLoading: false,
        allUsage: null
      }
    );
  })

  it(`should handle ${PlanActionTypes.GET_USAGE_DATA_LOADING}`, () => {
    expect(
      planReducer(planReducerInitialState, {
        type: PlanActionTypes.GET_USAGE_DATA_LOADING
      })
    ).toEqual(
      {
        ...planReducerInitialState,
        isGetUsageDataLoading: true
      }
    );
  })

  it(`should handle ${PlanActionTypes.GET_USAGE_DATA_ERROR}`, () => {
    expect(
      planReducer(planReducerInitialState, {
        type: PlanActionTypes.GET_USAGE_DATA_ERROR
      })
    ).toEqual(
      {
        ...planReducerInitialState,
        isGetUsageDataLoading: false
      }
    );
  })

  it(`should handle ${PlanActionTypes.GET_PLAN_DATA_ERROR}`, () => {
    expect(
      planReducer(planReducerInitialState, {
        type: PlanActionTypes.GET_PLAN_DATA_ERROR
      })
    ).toEqual(
      {
        ...planReducerInitialState,
        isGetPlanDataLoading: false
      }
    );
  })
})