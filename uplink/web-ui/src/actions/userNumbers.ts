import { Action } from 'redux';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { NotificationType } from '../components';
import { ThunkResult } from '../types';
import { UserNumber, UserNumberType } from '../apollo/types';
import { UserNumbersMessaging } from '../constants/messaging';
import { getAllUserNumbersQuery } from '../apollo/queries';
import { updatePendingNumberAssignments, unassignUser } from './';

export interface UserNumbersAction extends Action {
  type: UserNumbersActionTypes;
  payload?: UserNumber[] | null;
}

export enum UserNumbersActionTypes {
  SET_ALL_USER_NUMBERS_DATA = 'SET_ALL_USER_NUMBERS_DATA',
  GET_ALL_USER_NUMBERS_DATA_LOADING = 'GET_ALL_USER_NUMBERS_DATA_LOADING',
  GET_ALL_USER_NUMBERS_DATA_ERROR = 'GET_ALL_USER_NUMBERS_DATA_ERROR'
}

/** Set user numbers data */
export const setAllUserNumbersData = (payload: UserNumber[]): UserNumbersAction => ({
  type: UserNumbersActionTypes.SET_ALL_USER_NUMBERS_DATA,
  payload
});

/** Get all user numbers data error */
export const getAllUserNumbersDataError = (): UserNumbersAction => ({
  type: UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_ERROR
});

/** Get user numbers data loading state */
export const getAllUserNumbersDataLoading = (): UserNumbersAction => ({
  type: UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_LOADING
});

export const getAllUserNumbersData = (): ThunkResult<UserNumber[]> => {
  return async (dispatch) => {
    dispatch(getAllUserNumbersDataLoading());
    return client.query({
      query: getAllUserNumbersQuery
    }).then(
      ({ data }) => {
        dispatch(setAllUserNumbersData(data.getPhoneNumbers));
        dispatch(updatePendingNumberAssignments(data.getPhoneNumbers));
      },
      () => {
        dispatch(getAllUserNumbersDataError());
        renderFeedback([{
          message: UserNumbersMessaging.GET_ALL_USER_NUMBERS_DATA_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Assign a user to userNumber */
export const forwardUserNumber = (forwardingNumber: UserNumber, userNumber: UserNumber): ThunkResult<null> => {
  const { forward, messages, user, ...rest } = forwardingNumber;
  return async (dispatch, state) => {
    const updatedUserNumbers = state().assignNumbers.pendingNumberAssignments!.map((existingUserNumber: any) => {
      if (existingUserNumber.id === userNumber.id) {
        return {
          ...existingUserNumber,
          user: null,
          type: UserNumberType.FORWARD,
          forward: rest
        };
      }
      return existingUserNumber;
    });
    // Update unassigned users list
    if (userNumber.user) {
      dispatch(unassignUser(userNumber.user));
    }
    // Update assignments list
    dispatch(updatePendingNumberAssignments(updatedUserNumbers));
  };
};

/** Unassigns a User Number */
export const unassignUserNumber = (userNumberId: number, assignedUserNumber: string): ThunkResult<null> => {
  return async (dispatch, state) => {
    const updatedUserNumbers = state().assignNumbers.pendingNumberAssignments!.map((existingUserNumber: UserNumber) => {
      // Checks if the User Number is being forwarded and then checks the ID of the forwarded number along with the User Number
      if (
        existingUserNumber.forward
        && (existingUserNumber.forward.id === userNumberId && existingUserNumber.systemNumber === assignedUserNumber)
      ) {
        return {
          ...existingUserNumber,
          type: UserNumberType.UNASSIGNED,
          forward: null
        };
      }
      return existingUserNumber;
    });
    dispatch(updatePendingNumberAssignments(updatedUserNumbers));
  };
};