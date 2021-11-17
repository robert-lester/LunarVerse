import { Action } from 'redux';
import { ThunkResult } from '../types';
import client from '../apollo/apolloClient';

import renderFeedback from '../apollo/feedback';
import { AssignNumbersMessaging } from '../constants/messaging';
import { MonthYear } from '../components/MonthPicker/MonthPicker';
import { NotificationType } from '../components';
import { Usage, User, UserNumber, UserNumberType, UpdatingUserNumber, UpdatedUserInfo } from '../apollo/types';
import { updatePhoneNumbersMutation, updateUsersMutation } from '../apollo/mutations';

export interface AssignNumbersAction extends Action {
  type: AssignNumbersActionTypes;
  payload?: Usage | MonthYear | UserNumber[] | User[] | string | null;
}

export enum AssignNumbersActionTypes {
  DISCARD_PENDING_NUMBER_ASSIGNMENTS = 'DISCARD_PENDING_NUMBER_ASSIGNMENTS',
  SAVE_NUMBER_ASSIGNMENTS = 'SAVE_NUMBER_ASSIGNMENTS',
  SAVE_NUMBER_ASSIGNMENTS_LOADING = 'SAVE_NUMBER_ASSIGNMENTS_LOADING',
  SAVE_NUMBER_ASSIGNMENTS_SUCCESS = 'SAVE_NUMBER_ASSIGNMENTS_SUCCESS',
  SAVE_NUMBER_ASSIGNMENTS_ERROR = 'SAVE_NUMBER_ASSIGNMENTS_ERROR',
  UPDATE_PENDING_NUMBER_ASSIGNMENTS = 'UPDATE_PENDING_NUMBER_ASSIGNMENTS',
  UPDATE_PENDING_UNASSIGNED_USERS = 'UPDATE_PENDING_UNASSIGNED_USERS'
}

const types = {
  forward: UserNumberType.FORWARD,
  user: UserNumberType.USER
};

/** Gets an assigned id */
export const getAssignedId = (userNumber: UserNumber) => {
  const user = userNumber[Object.keys(types).filter(key => userNumber[key])[0]];
  return user && user.id || null;
};

/** Gets a type */
export const getAssignmentType = (userNumber: UserNumber) => {
  return types[Object.keys(types).filter(key => userNumber[key])[0]] || UserNumberType.UNASSIGNED;
};

/** Gets the users from the assignments */
export const getAssignmentUsers = (assignments: UserNumber[] | null) => {
  if (assignments) {
    return assignments
      .filter(pendingAssignment => pendingAssignment.user)
      .map(assignment => assignment.user);
  }
  return [];
};

/** Gets a list of pending users and original users to find any changes */
export const getAllUsers = (
  pendingNumberAssignments: UserNumber[],
  pendingUnassignedUsers: User[],
  unassignedUsers: User[] | null,
  allUserNumbers: UserNumber[] | null
): UpdatedUserInfo[] => {
  const pendingAssignmentUsers = getAssignmentUsers(pendingNumberAssignments);
  const pendingUsers = pendingAssignmentUsers.concat(pendingUnassignedUsers);
  const originalAssignmentUsers: User[] = getAssignmentUsers(allUserNumbers);
  const originalUsers: User[] = (unassignedUsers || []).concat(originalAssignmentUsers);
  const allUsers: UpdatedUserInfo[] = [];
  // Find changes
  pendingUsers.forEach(pendingUser => {
    const originalUser = originalUsers!.find(user => user.id === pendingUser.id);
    const changedUser: UpdatedUserInfo = { id: pendingUser.id };
    if (originalUser) {
      if (originalUser!.name !== pendingUser.name) {
        changedUser.name = pendingUser.name;
      }
      if (originalUser!.physicalNumber !== pendingUser.physicalNumber) {
        changedUser.physicalNumber = pendingUser.physicalNumber;
      }
    }
    if (changedUser.name || changedUser.physicalNumber) {
      allUsers.push(changedUser);
    }
  });
  return allUsers;
};

/** Gets all of the number assignment updates */
export const getNumberAssignmentUpdates = (pendingNumberAssignments: UserNumber[], allUserNumbers: UserNumber[] | null) => {
  // Get only users that have been updated
  const updatedNumberAssignments = pendingNumberAssignments.filter((userNumber, index) => {
    const originalUserNumber = allUserNumbers![index];
    if (userNumber.forward !== originalUserNumber.forward
      || (userNumber.user && originalUserNumber.user && userNumber.user.id !== originalUserNumber.user.id)
      || userNumber.type !== originalUserNumber.type) {
      return true;
    }
    return false;
  });
  // Get updates payload
  return updatedNumberAssignments.map(userNumber => {
    const assignedId = getAssignedId(userNumber);
    const updatedUserNumber: UpdatingUserNumber = {
      id: userNumber.id,
      type: getAssignmentType(userNumber)
    };
    if (assignedId) {
      updatedUserNumber.assigned_id = assignedId;
    }
    return updatedUserNumber;
  });
};

/** Save number assignments loading */
export const saveNumberAssignmentsLoading = (): AssignNumbersAction => ({
  type: AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING
});

/** Save number assignments success */
export const saveNumberAssignmentsSuccess = (): AssignNumbersAction => ({
  type: AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_SUCCESS
});

/** Save number assignments error */
export const saveNumberAssignmentsError = (): AssignNumbersAction => ({
  type: AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_ERROR
});

/** Saves number assignments */
export const saveNumberAssignments = (): ThunkResult<UserNumber[]> => {
  return async (dispatch, state) => {
    const { pendingNumberAssignments } = state().assignNumbers;
    const { allUserNumbers } = state().userNumbers;
    const updates = getNumberAssignmentUpdates(pendingNumberAssignments, allUserNumbers);
    if (!updates.length) {
      return;
    }
    dispatch(saveNumberAssignmentsLoading());
    return client.mutate({
      mutation: updatePhoneNumbersMutation,
      variables: {
        updates
      }
    }).then(
      () => {
        dispatch(saveNumberAssignmentsSuccess());
        renderFeedback([{
          message: AssignNumbersMessaging.SAVE_NUMBER_ASSIGNMENTS_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      () => {
        dispatch(saveNumberAssignmentsError());
        renderFeedback([{
          message: AssignNumbersMessaging.SAVE_NUMBER_ASSIGNMENTS_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Saves all users */
export const saveUsers = (): ThunkResult<User[]> => {
  return async (dispatch, state) => {
    const { pendingNumberAssignments, pendingUnassignedUsers } = state().assignNumbers;
    const { unassignedUsers } = state().users;
    const { allUserNumbers } = state().userNumbers;
    const updates = getAllUsers(pendingNumberAssignments, pendingUnassignedUsers, unassignedUsers, allUserNumbers);
    if (!updates.length) {
      return;
    }
    dispatch(saveNumberAssignmentsLoading());
    return client.mutate({
      mutation: updateUsersMutation,
      variables: {
        updates
      }
    }).then(
      () => {
        dispatch(saveNumberAssignmentsSuccess());
        renderFeedback([{
          message: AssignNumbersMessaging.SAVE_USERS_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      () => {
        dispatch(saveNumberAssignmentsError());
        renderFeedback([{
          message: AssignNumbersMessaging.SAVE_USERS_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Update pending number assignments */
export const updatePendingNumberAssignments = (payload: UserNumber[]): AssignNumbersAction => ({
  type: AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS,
  payload
});

/** Updates pending unassigned user numbers */
export const updatePendingUnassignedUsers = (payload: User[]): AssignNumbersAction => ({
  type: AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS,
  payload
});

/** Discard pending number assignments */
export const discardPendingNumberAssignments = (): ThunkResult<{}> => {
  return async (dispatch, state) => {
    dispatch(updatePendingNumberAssignments(state().userNumbers.allUserNumbers as UserNumber[]));
    dispatch(updatePendingUnassignedUsers(state().users.unassignedUsers as User[]));
  };
};