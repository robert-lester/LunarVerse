import { Action } from 'redux';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { NotificationType } from '../components';
import { ThunkResult } from '../types';
import { User } from '../apollo/types';
import { UsersMessaging } from '../constants/messaging';
import { getUnassignedUsersQuery, getUsersQuery } from '../apollo/queries';
import { sortByName } from '../utils';
import { updatePendingUnassignedUsers, saveNumberAssignmentsSuccess, saveNumberAssignmentsError } from './assignNumbers';

export interface UsersAction extends Action {
  type: UsersActionTypes;
  payload?: User[] | string | null;
}

export enum UsersActionTypes {
  SET_USERS = 'SET_USERS',
  GET_USERS = 'GET_USERS',
  SET_UNASSIGNED_USERS_DATA = 'SET_UNASSIGNED_USERS_DATA',
  GET_UNASSIGNED_USERS_DATA_LOADING = 'GET_UNASSIGNED_USERS_DATA_LOADING'
}

/** Set Users */
export const setUsers = (payload: User[]): UsersAction => ({
  type: UsersActionTypes.SET_USERS,
  payload
});

/** Get user unassigned users data loading state */
export const getUnassignedUsersDataLoading = (): UsersAction => ({
  type: UsersActionTypes.GET_UNASSIGNED_USERS_DATA_LOADING
});

/** Set unassigned users data */
export const setUnassignedUsersData = (payload: User[]): UsersAction => ({
  type: UsersActionTypes.SET_UNASSIGNED_USERS_DATA,
  payload
});

/** Get Users */
export const getUsers = (): ThunkResult<User[]> => {
  return async (dispatch) =>
    client.query({
      query: getUsersQuery,
    }).then(
      ({ data }) =>
        dispatch(setUsers(data.getUsers)),
      () => renderFeedback([{
        message: UsersMessaging.GET_USERS_ERROR,
        type: NotificationType.ERROR
      }])
    );
};

/** Get unassigned users data */
export const getUnassignedUsersData = (): ThunkResult<User[]> => {
  return async (dispatch) => {
    dispatch(getUnassignedUsersDataLoading());
    return client.query({
      query: getUnassignedUsersQuery
    }).then(
      ({ data }) => {
        const unassignedUsers = data.getUsers.sort(sortByName);
        dispatch(saveNumberAssignmentsSuccess());
        dispatch(setUnassignedUsersData(unassignedUsers));
        dispatch(updatePendingUnassignedUsers(unassignedUsers));
      },
      () => {
        dispatch(saveNumberAssignmentsError());
        renderFeedback([{
          message: UsersMessaging.GET_UNASSIGNED_USERS_DATA_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};