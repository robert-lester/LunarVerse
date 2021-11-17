import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as usersActions from '../users';
import { UsersActionTypes } from '../users';
import { UserNumberType } from '../../apollo/types';
import root from '../../reducers/root';
import { AssignNumbersActionTypes } from '../assignNumbers';

describe('Users actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  const user = {
    color: 'blue',
    directDialNumber: '1234567788',
    id: 2,
    name: 'Test',
    phoneNumber: null,
    physicalNumber: '1123345566',
    systemNumber: '2223334455',
    type: UserNumberType.USER
  };
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set users', () => {
    expect(usersActions.setUsers([user]).type).toEqual(UsersActionTypes.SET_USERS)
  });

  it('should create an action to get unassigned users data loading', () => {
    expect(usersActions.getUnassignedUsersDataLoading().type).toEqual(UsersActionTypes.GET_UNASSIGNED_USERS_DATA_LOADING)
  });

  it('should create an action to set unassigned users data', () => {
    expect(usersActions.setUnassignedUsersData([user]).type).toEqual(UsersActionTypes.SET_UNASSIGNED_USERS_DATA)
  });

  it('should dispatch actions for get users success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getUsers: [] } }));
    // @ts-ignore
    return store.dispatch(usersActions.getUsers()).then(() => {
      const expectedActions  = [
        UsersActionTypes.SET_USERS
      ]
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for get users error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getUsers: [] } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(usersActions.getUsers()).then(() => {
      expect(store.getActions().map(action => action.type)).toEqual([]);
    });
  });

  it('should dispatch actions for get unassigned users data success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getUsers: [] } }));
    // @ts-ignore
    return store.dispatch(usersActions.getUnassignedUsersData()).then(() => {
      const expectedActions = [
        UsersActionTypes.GET_UNASSIGNED_USERS_DATA_LOADING,
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_SUCCESS,
        UsersActionTypes.SET_UNASSIGNED_USERS_DATA,
        AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS
      ]
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for get unassigned users data error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getUsers: [] } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(usersActions.getUnassignedUsersData()).then(() => {
      const expectedActions = [
        UsersActionTypes.GET_UNASSIGNED_USERS_DATA_LOADING,
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_ERROR
      ]
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});