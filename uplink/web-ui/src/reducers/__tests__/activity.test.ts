import moment from 'moment';

import activityReducer, { activityReducerInitialState } from '../activity';
import { ActivityActionTypes } from '../../actions';
import { UserNumberType } from '../../apollo/types';
import { Months } from '../../components/MonthPicker/MonthPicker';
import { MessageType, ChartType } from '../../types';

describe('activity reducer', () => {
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(activityReducer(activityReducerInitialState, {})).toEqual(activityReducerInitialState)
  })

  it(`should handle ${ActivityActionTypes.SET_SELECTED_NUMBER}`, () => {
    const selectedUserNumber = {
      forward: null,
      id: 123,
      messages: [],
      systemNumber: '407-738-7892',
      type: UserNumberType.CONTACT,
      user: {
        color: 'blue',
        directDialNumber: '1234567788',
        id: 2,
        name: 'Test',
        phoneNumber: null,
        physicalNumber: '1123345566',
        systemNumber: '2223334455',
        type: UserNumberType.USER
      },
      callOrText30Days: false
    };
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.SET_SELECTED_NUMBER,
        payload: selectedUserNumber
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        selectedUserNumbers: [selectedUserNumber]
      }
    );
  })

  it(`should handle ${ActivityActionTypes.CLEAR_SELECTED_NUMBERS}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.CLEAR_SELECTED_NUMBERS
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        selectedUserNumbers: []
      }
    );
  })

  it(`should handle ${ActivityActionTypes.SET_CHART_DATA}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.SET_CHART_DATA,
        payload: null,
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        chartData: null,
        isChartDataLoading: false
      }
    );
  })

  it(`should handle ${ActivityActionTypes.GET_CHART_DATA_LOADING}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.GET_CHART_DATA_LOADING
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        isChartDataLoading: true
      }
    );
  })

  it(`should handle ${ActivityActionTypes.GET_CHART_DATA_ERROR}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.GET_CHART_DATA_ERROR
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        isChartDataLoading: false,
        chartData: null
      }
    );
  })

  it(`should handle ${ActivityActionTypes.SET_ACTIVITY_DATE_RANGE}`, () => {
    const dateRange = {
      month: 'January' as Months,
      year: '2019'
    };
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.SET_ACTIVITY_DATE_RANGE,
        payload: dateRange
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        dateRange: {
          initial: moment().year(Number(dateRange.year)).month(dateRange.month).startOf('month'),
          final: moment().year(Number(dateRange.year)).month(dateRange.month).endOf('month')
        }
      }
    );
  })

  it(`should handle ${ActivityActionTypes.SET_MESSAGE_TYPE}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.SET_MESSAGE_TYPE,
        payload: MessageType.INBOUND
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        messageType: MessageType.INBOUND
      }
    );
  })

  it(`should handle ${ActivityActionTypes.SET_CHART_TYPE}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.SET_CHART_TYPE,
        payload: ChartType.ALL_MESSAGES
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        chartType: ChartType.ALL_MESSAGES
      }
    );
  })

  it(`should handle ${ActivityActionTypes.SET_ACTIVITY_DATA}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.SET_ACTIVITY_DATA,
        payload: null
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        activityData: null,
        isActivityDataLoading: false
      }
    );
  })

  it(`should handle ${ActivityActionTypes.GET_ACTIVITY_DATA_ERROR}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.GET_ACTIVITY_DATA_ERROR
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        isActivityDataLoading: false
      }
    );
  })

  it(`should handle ${ActivityActionTypes.GET_ACTIVITY_DATA_LOADING}`, () => {
    expect(
      activityReducer(activityReducerInitialState, {
        type: ActivityActionTypes.GET_ACTIVITY_DATA_LOADING
      })
    ).toEqual(
      {
        ...activityReducerInitialState,
        isActivityDataLoading: true
      }
    );
  })
})