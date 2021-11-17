import usersReducer, { usersReducerInitialState } from '../users';
import { UsersActionTypes } from '../../actions';
import { UserNumberType } from '../../apollo/types';

describe('users reducer', () => {
  const payload = [{
    color: 'blue',
    directDialNumber: '1234567788',
    id: 2,
    name: 'Test',
    phoneNumber: null,
    physicalNumber: '1123345566',
    systemNumber: '2223334455',
    type: UserNumberType.USER
  }];

  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(usersReducer(usersReducerInitialState, {})).toEqual(usersReducerInitialState)
  })

  it(`should handle ${UsersActionTypes.SET_USERS}`, () => {
    expect(
      usersReducer(usersReducerInitialState, {
        type: UsersActionTypes.SET_USERS,
        payload
      })
    ).toEqual(
      {
        ...usersReducerInitialState,
        allUsers: payload
      }
    );
  })

  it(`should handle ${UsersActionTypes.SET_UNASSIGNED_USERS_DATA}`, () => {
    expect(usersReducer(usersReducerInitialState, {
      type: UsersActionTypes.SET_UNASSIGNED_USERS_DATA,
      payload
    })).toEqual(
      {
        ...usersReducerInitialState,
        unassignedUsers: payload,
        isUnassignedUsersDataLoading: false
      }
    )
  })

  it(`should handle ${UsersActionTypes.GET_UNASSIGNED_USERS_DATA_LOADING}`, () => {
    expect(usersReducer(usersReducerInitialState, {
      type: UsersActionTypes.GET_UNASSIGNED_USERS_DATA_LOADING
    })).toEqual(
      {
        ...usersReducerInitialState,
        isUnassignedUsersDataLoading: true
      }
    )
  })
})