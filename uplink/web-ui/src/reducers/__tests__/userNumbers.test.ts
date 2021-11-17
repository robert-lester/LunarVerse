import userNumbersReducer, { userNumbersReducerInitialState } from '../userNumbers';
import { UserNumbersActionTypes } from '../../actions';
import { UserNumberType } from '../../apollo/types';

describe('user numbers reducer', () => {
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(userNumbersReducer(userNumbersReducerInitialState, {})).toEqual(userNumbersReducerInitialState)
  })

  it(`should handle ${UserNumbersActionTypes.SET_ALL_USER_NUMBERS_DATA}`, () => {
    const payload = [{
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
    }];
    expect(
      userNumbersReducer(userNumbersReducerInitialState, {
        type: UserNumbersActionTypes.SET_ALL_USER_NUMBERS_DATA,
        payload
      })
    ).toEqual(
      {
        isAllUserNumbersDataLoading: false,
        allUserNumbers: payload
      }
    );
  })

  it(`should handle ${UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_LOADING}`, () => {
    expect(userNumbersReducer(userNumbersReducerInitialState, {
      type: UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_LOADING
    })).toEqual(userNumbersReducerInitialState)
  })

  it(`should handle ${UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_ERROR}`, () => {
    expect(userNumbersReducer(userNumbersReducerInitialState, {
      type: UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_ERROR
    })).toEqual(
      { ...userNumbersReducerInitialState,
        isAllUserNumbersDataLoading: false
      }
    )
  })
})