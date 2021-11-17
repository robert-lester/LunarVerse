import thunk from 'redux-thunk';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';

import * as userNumbersActions from '../userNumbers';
import { AssignNumbersActionTypes } from '../assignNumbers';
import { UserNumberType } from '../../apollo/types';
import { UserNumbersActionTypes } from "../userNumbers";
import { assignNumbersReducerInitialState } from '../../reducers';
import { userNumberMock } from '../../utils/mocks';

describe('User Numbers actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  const userNumber = {
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
  const state = {
    assignNumbers: {
      ...assignNumbersReducerInitialState,
      pendingNumberAssignments: [userNumberMock]
    }
  }
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(state);
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set set all user numbers data', () => {
    expect(userNumbersActions.setAllUserNumbersData([userNumber]).type).toEqual(UserNumbersActionTypes.SET_ALL_USER_NUMBERS_DATA)
  });

  it('should create an action to set get all user numbers data to error', () => {
    expect(userNumbersActions.getAllUserNumbersDataError().type).toEqual(UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_ERROR)
  });

  it('should create an action to set get all user numbers data to loading', () => {
    expect(userNumbersActions.getAllUserNumbersDataLoading().type).toEqual(UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_LOADING)
  });

  it('should dispatch actions for get all user numbers data success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getPhoneNumbers: {} } }));
    // @ts-ignore
    return store.dispatch(userNumbersActions.getAllUserNumbersData()).then(() => {
      const expectedActions = [
        UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_LOADING,
        UserNumbersActionTypes.SET_ALL_USER_NUMBERS_DATA,
        AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for get all user numbers data error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getPhoneNumbers: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(userNumbersActions.getAllUserNumbersData()).then(() => {
      const expectedActions = [
        UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_LOADING,
        UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for forward user number success', () => {
    // @ts-ignore
    return store.dispatch(userNumbersActions.forwardUserNumber(userNumber, userNumber)).then(() => {
      const expectedActions = [
        AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS,
        AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS,
        AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for unassign user number success', () => {
    // @ts-ignore
    store.dispatch(userNumbersActions.unassignUserNumber(0, '')).then(() => {
      const expectedActions = [
        AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});