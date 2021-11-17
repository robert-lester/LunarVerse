import { PlanActionTypes, PlanAction } from '../actions';
import { PlanData, GetUserNumberUsageData } from '../apollo/types';

export interface PlanState {
  readonly allUsage: GetUserNumberUsageData | null;
  readonly payload: PlanData | null;
  readonly isGetUsageDataLoading: boolean;
  readonly isGetPlanDataLoading: boolean;
}

export const planReducerInitialState = {
  allUsage: null,
  payload: null,
  isGetUsageDataLoading: true,
  isGetPlanDataLoading: true
};

const plan = (
  state = planReducerInitialState,
  action: PlanAction
) => {
  switch (action.type) {
    case PlanActionTypes.SET_PLAN_DATA:
      return {
        ...state,
        payload: action.payload,
        isGetPlanDataLoading: false
      };
    case PlanActionTypes.SET_USAGE_DATA:
      return {
        ...state,
        allUsage: action.payload,
        isGetUsageDataLoading: false
      };
    case PlanActionTypes.GET_USAGE_DATA_LOADING:
      return {
        ...state,
        isGetUsageDataLoading: true
      };
    case PlanActionTypes.GET_USAGE_DATA_ERROR:
      return {
        ...state,
        isGetUsageDataLoading: false
      };
    case PlanActionTypes.GET_PLAN_DATA_ERROR:
      return {
        ...state,
        isGetPlanDataLoading: false
      };
    default:
      return state;
  }
};

export default plan;