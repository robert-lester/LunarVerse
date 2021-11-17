import moment from 'moment';

import { ActivityActionTypes, ActivityAction } from '../actions';
import { MonthYear } from '../components/MonthPicker/MonthPicker';
import { Usage, DateRange, UserNumber, Activity } from '../apollo/types';
import { MessageType, ChartType } from '../types';

export interface ActivityState {
  readonly selectedUserNumbers: UserNumber[];
  readonly chartData: Usage | null;
  readonly messageType: MessageType;
  readonly chartType: ChartType;
  readonly dateRange: DateRange;
  readonly isChartDataLoading: boolean;
  readonly activityData: Activity | null;
  readonly isActivityDataLoading: boolean;
}

export const activityReducerInitialState: ActivityState = {
  chartData: null,
  dateRange: {
    initial: moment().startOf('month'),
    final: moment().endOf('month')
  },
  selectedUserNumbers: [],
  messageType: MessageType.INBOUND_OUTBOUND,
  chartType: ChartType.ALL_MESSAGES,
  isChartDataLoading: true,
  activityData: null,
  isActivityDataLoading: true
}

/** REDUCER */

const activity = (
  state = activityReducerInitialState,
  action: ActivityAction
) => {
  switch (action.type) {
    case ActivityActionTypes.SET_SELECTED_NUMBER:
      return {
        ...state,
        selectedUserNumbers: toggleSelectedUserNumber(action.payload as UserNumber, state.selectedUserNumbers)
      };
    case ActivityActionTypes.CLEAR_SELECTED_NUMBERS:
      return {
        ...state,
        selectedUserNumbers: []
      };
    case ActivityActionTypes.SET_CHART_DATA:
      return {
        ...state,
        chartData: action.payload,
        isChartDataLoading: false
      };
    case ActivityActionTypes.GET_CHART_DATA_LOADING:
      return {
        ...state,
        isChartDataLoading: true
      };
    case ActivityActionTypes.GET_CHART_DATA_ERROR:
      return {
        ...state,
        isChartDataLoading: false,
        chartData: null
      };
    case ActivityActionTypes.SET_ACTIVITY_DATE_RANGE:
      return {
        ...state,
        dateRange: formatDateRange(action.payload as MonthYear)
      };
    case ActivityActionTypes.SET_MESSAGE_TYPE:
      return {
        ...state,
        messageType: action.payload
      };
    case ActivityActionTypes.SET_CHART_TYPE:
      return {
        ...state,
        chartType: action.payload
      };
    case ActivityActionTypes.SET_ACTIVITY_DATA:
      return {
        ...state,
        activityData: action.payload,
        isActivityDataLoading: false
      };
    case ActivityActionTypes.GET_ACTIVITY_DATA_ERROR:
      return {
        ...state,
        isActivityDataLoading: false
      };
    case ActivityActionTypes.GET_ACTIVITY_DATA_LOADING:
      return {
        ...state,
        isActivityDataLoading: true
      };
    default:
      return state;
  }
};

/** CASE LOGIC REDUCTION */

/** Toggles the selected number */
function toggleSelectedUserNumber(userNumber: UserNumber, selectedNumbers: UserNumber[]) {
  // Removes id if it already exists
  if (selectedNumbers.find(selectedNumber => selectedNumber.id === userNumber.id)) {
    return selectedNumbers.filter((selectedNumber: UserNumber) => selectedNumber !== userNumber);
  }
  return [...selectedNumbers, userNumber];
}

/** Formats the date range for the MonthPicker component */
function formatDateRange({ month, year }: MonthYear) {
  const initial = moment().year(Number(year)).month(month).startOf('month');
  const final = moment().year(Number(year)).month(month).endOf('month');
  return {
    initial,
    final
  };
}

export default activity;