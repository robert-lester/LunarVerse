import { UsersActionTypes, UsersAction } from '../actions';
import { User } from '../apollo/types';

export interface UsersState {
  readonly allUsers: User[] | null;
  readonly selected: string[];
  readonly unassignedUsers: User[] | null;
  readonly isUnassignedUsersDataLoading: boolean;
}

export const usersReducerInitialState: UsersState = {
  allUsers: null,
  unassignedUsers: null,
  isUnassignedUsersDataLoading: true,
  selected: []
};

const users = (
  state = usersReducerInitialState,
  action: UsersAction
) => {
  switch (action.type) {
    case UsersActionTypes.SET_USERS:
      return {
        ...state,
        allUsers: action.payload
      };
    case UsersActionTypes.SET_UNASSIGNED_USERS_DATA:
      return {
        ...state,
        unassignedUsers: action.payload,
        isUnassignedUsersDataLoading: false
      };
    case UsersActionTypes.GET_UNASSIGNED_USERS_DATA_LOADING:
      return {
        ...state,
        isUnassignedUsersDataLoading: true
      };
    default:
      return state;
  }
};

export default users;