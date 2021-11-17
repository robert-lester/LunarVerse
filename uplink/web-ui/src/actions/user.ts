import { Action } from 'redux';
import { ApolloQueryResult } from 'apollo-client';
import { isEqual } from 'lodash';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { CreateNewUserVariables, User, UserNumber, UserNumberType, CreateUserData, GetUserData } from '../apollo/types';
import { NotificationType } from '../components';
import { ThunkResult } from '../types';
import { UserToDelete } from '../pages/AssignNumbers/components/DeleteUser';
import { UserToEdit } from '../pages/AssignNumbers/components/EditUser';
import { createNewUserMutation, deleteUserMutation } from '../apollo/mutations';
import { sortByName, updateUserNumberWithAssignedUser } from '../utils';
import { getUserByPhysicalPhoneQuery } from '../apollo/queries';
import {
  getUsageData,
  getAllUserNumbersData,
  getUnassignedUsersData,
  updatePendingNumberAssignments,
  updatePendingUnassignedUsers,
  saveNumberAssignments
} from './';
import { UserMessaging } from '../constants/messaging';

export interface UserAction extends Action {
  type: UserActionTypes;
  payload?: UserToDelete | UserToEdit | UserNumber | number | null;
}

export enum UserActionTypes {
  SET_USER_TO_DELETE = 'SET_USER_TO_DELETE',
  DELETE_USER = 'DELETE_USER',
  DELETE_USER_LOADING = 'DELETE_USER_LOADING',
  DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS',
  UPDATE_USER = 'UPDATE_USER',
  TOGGLE_NEW_USER_MODAL = 'TOGGLE_NEW_USER_MODAL',
  TOGGLE_DELETE_USER_MODAL = 'TOGGLE_DELETE_USER_MODAL',
  CLOSE_DELETE_USER_MODAL = 'CLOSE_DELETE_USER_MODAL',
  TOGGLE_EDIT_USER_MODAL = 'TOGGLE_EDIT_USER_MODAL',
  TOGGLE_WILL_ASSIGN_NEW_USER = 'TOGGLE_WILL_ASSIGN_NEW_USER',
  CREATE_NEW_USER = 'CREATE_NEW_USER',
  CREATE_NEW_USER_LOADING = 'CREATE_NEW_USER_LOADING',
  CREATE_NEW_USER_SUCCESS = 'CREATE_NEW_USER_SUCCESS',
  SET_USER_DATA = 'SET_USER_DATA',
  GET_USER_DATA_ERROR = 'GET_USER_DATA_ERROR',
  SIGN_OUT = 'SIGN_OUT'
}

/** Toggles the delete user modal */
export const toggleDeleteUserModal = (payload?: UserToDelete): UserAction => ({
  type: UserActionTypes.TOGGLE_DELETE_USER_MODAL,
  payload
});

/** Closes the delete user modal */
export const closeDeleteUserModal = (): UserAction => ({
  type: UserActionTypes.CLOSE_DELETE_USER_MODAL
});

/** Toggles the new user modal */
export const toggleNewUserModal = (): UserAction => ({
  type: UserActionTypes.TOGGLE_NEW_USER_MODAL
});

/** Toggles the edit user modal */
export const toggleEditUserModal = (payload?: UserToEdit): UserAction => ({
  type: UserActionTypes.TOGGLE_EDIT_USER_MODAL,
  payload
});

/** Toggles the value of the number to assign to when the User is created */
export const toggleWillAssignNewUser = (payload?: UserNumber): UserAction => ({
  type: UserActionTypes.TOGGLE_WILL_ASSIGN_NEW_USER,
  payload
});

/** Create User loading */
export const deleteUserLoading = (): UserAction => ({
  type: UserActionTypes.DELETE_USER_LOADING
});

/** Delete user success */
export const deleteUserSuccess = (): UserAction => ({
  type: UserActionTypes.DELETE_USER_SUCCESS
});

/** Create User loading */
export const createNewUserLoading = (): UserAction => ({
  type: UserActionTypes.CREATE_NEW_USER_LOADING
});

/** Create User */
export const createNewUserSuccess = (): UserAction => ({
  type: UserActionTypes.CREATE_NEW_USER_SUCCESS
});

/** Set User */
export const setUserData = (payload: User): UserAction => ({
  type: UserActionTypes.SET_USER_DATA,
  payload
});

/** Get user data error */
export const getUserDataError = (): UserAction => ({
  type: UserActionTypes.GET_USER_DATA_ERROR
});

/** Delete user */
export const deleteUser = (): ThunkResult<null> => {
  return async (dispatch, state) => {
    const userId = state().user.toEdit.id;
    dispatch(deleteUserLoading());
    client.mutate({
      mutation: deleteUserMutation,
      variables: { id: userId }
    }).then(
      async () => {
        const pendingNumberAssignments = state().assignNumbers.pendingNumberAssignments;
        // The impacted number assignment by deletion
        const changedAssignment = pendingNumberAssignments.find(assignment => {
          if (assignment.user && assignment.user.id === userId) {
            return true;
          }
          return false;
        });
        renderFeedback([{
          message: UserMessaging.DELETE_USER_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
        dispatch(toggleDeleteUserModal());
        dispatch(deleteUserSuccess());
        // Save all users only if changes exist
        // If unassigned list was impacted or changed
        // Save and get all number assignments
        await dispatch(saveNumberAssignments());
        // If assignment list was impacted
        if (changedAssignment) {
          await dispatch(getAllUserNumbersData());
          dispatch(getUsageData());
        }
        if (state().assignNumbers.pendingUnassignedUsers.find(user => user.id === userId)
          || !isEqual(state().users.unassignedUsers, state().assignNumbers.pendingUnassignedUsers)) {
          dispatch(getUnassignedUsersData());
        }
      },
      () => renderFeedback([{
        message: UserMessaging.DELETE_USER_ERROR,
        type: NotificationType.ERROR
      }])
    );
  };
};

/** Assign a User to User Number */
export const assignUser = (user: User, userNumber: UserNumber): ThunkResult<null> => {
  return async (dispatch, state) => {
    const updatedUserNumbers = state().assignNumbers.pendingNumberAssignments!.map(
      (existingUserNumber) => updateUserNumberWithAssignedUser(existingUserNumber, userNumber, user)
    );
    let unassignedUsers = [...(state().assignNumbers.pendingUnassignedUsers as User[])];
    const index = unassignedUsers.indexOf(user);
    if (index !== -1) {
      // Remove user and add in replaced user
      unassignedUsers.splice(index, 1);
      if (userNumber.user) {
        unassignedUsers.push(userNumber.user);
      }
      // Sort alphabetically
      unassignedUsers = unassignedUsers.sort(sortByName);
      dispatch(updatePendingUnassignedUsers(unassignedUsers));
    }
    dispatch(updatePendingNumberAssignments(updatedUserNumbers));
  };
};

/** Unassigns a User from a User Number */
export const unassignUser = (user: User): ThunkResult<null> => {
  return async (dispatch, state) => {
    let unassignedUsers = [...(state().assignNumbers.pendingUnassignedUsers as User[])];
    const updatedUserNumbers = state().assignNumbers.pendingNumberAssignments!.map((existingUserNumber: any) => {
      if (existingUserNumber.user && existingUserNumber.user.id === user.id) {
        // Add unassigned user to unassigned list
        unassignedUsers.push(existingUserNumber.user);
        return {
          ...existingUserNumber,
          type: UserNumberType.UNASSIGNED,
          user: null
        };
      }
      return existingUserNumber;
    });
    // Sort alphabetically
    unassignedUsers = unassignedUsers.sort(sortByName);
    dispatch(updatePendingNumberAssignments(updatedUserNumbers));
    dispatch(updatePendingUnassignedUsers(unassignedUsers));
  };
};

/** Create new user */
export const createNewUser = (variables: CreateNewUserVariables): ThunkResult<null> => {
  return async (dispatch, state) => {
    dispatch(createNewUserLoading);
    client.mutate({
      mutation: createNewUserMutation,
      variables
    }).then(
      ({ data }: ApolloQueryResult<CreateUserData>) => {
        renderFeedback([{
          message: UserMessaging.CREATE_NEW_USER_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
        dispatch(toggleNewUserModal());
        dispatch(createNewUserSuccess());
        const userToAssign = state().user.toAssign;
        // If creation and assignment are happening
        if (userToAssign) {
          dispatch(assignUser(data.createUser, userToAssign));
          dispatch(toggleWillAssignNewUser());
        } else {
          dispatch(getUnassignedUsersData());
        }
      },
      () => renderFeedback([{
        message: UserMessaging.CREATE_NEW_USER_ERROR,
        type: NotificationType.ERROR
      }])
    );
  };
};

/** Updates an assigned user */
export const updateUser = (userUpdate: any): ThunkResult<null> => {
  return async (dispatch, state) => {
    const updatedUserNumbers = [...state().assignNumbers.pendingNumberAssignments!].map(userNumber => {
      if (userNumber.user && userUpdate.id === userNumber.user.id) {
        return {
          ...userNumber,
          user: {
            ...userNumber.user,
            ...userUpdate
          }
        };
      }
      return userNumber;
    });
    const updatedUnassignedUsers = [...state().assignNumbers.pendingUnassignedUsers!].map(user => {
      if (user.name && userUpdate.id === user.id) {
        return {
          ...user,
          ...userUpdate
        };
      }
      return user;
    });
    dispatch(toggleEditUserModal());
    dispatch(updatePendingNumberAssignments(updatedUserNumbers));
    dispatch(updatePendingUnassignedUsers(updatedUnassignedUsers));
  };
};

/** Get user data */
export const getUserData = (): ThunkResult<User> => {
  return async (dispatch) => {
    client.query<GetUserData>({
      query: getUserByPhysicalPhoneQuery,
      variables: {
        phoneNumber: sessionStorage.getItem('uplinkUserPhoneNumber')
      }
    }).then(
      ({ data }) =>
        dispatch(setUserData(data.getUserByPhysicalPhone)),
      error => {
        renderFeedback([{
          message: UserMessaging.NO_USER_DATA,
          type: NotificationType.ERROR
        }]);
        dispatch(getUserDataError());
      }
    );
  };
};
