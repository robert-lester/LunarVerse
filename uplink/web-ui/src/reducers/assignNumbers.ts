import { AssignNumbersAction, AssignNumbersActionTypes } from '../actions';
import { UserNumber, User } from '../apollo/types';

export interface AssignNumbersState {
  readonly isSaveNumberAssignmentsLoading: boolean;
  readonly pendingNumberAssignments: UserNumber[];
  readonly pendingUnassignedUsers: User[];
  readonly unassignedNumbers: UserNumber[];
}

export const assignNumbersReducerInitialState: AssignNumbersState = {
  isSaveNumberAssignmentsLoading: false,
  pendingNumberAssignments: [],
  pendingUnassignedUsers: [],
  unassignedNumbers: []
}

const assignNumbers = (
  state = assignNumbersReducerInitialState,
  action: AssignNumbersAction
) => {
  switch (action.type) {
    case AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING:
      return {
        ...state,
        isSaveNumberAssignmentsLoading: true
      };
    case AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_SUCCESS:
    case AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_ERROR:
      return {
        ...state,
        isSaveNumberAssignmentsLoading: false
      };
    case AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS:
    case AssignNumbersActionTypes.DISCARD_PENDING_NUMBER_ASSIGNMENTS:
      return {
        ...state,
        pendingNumberAssignments: action.payload
      };
    case AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS:
      return {
        ...state,
        pendingUnassignedUsers: action.payload
      };
    default:
      return state;
  }
};

export default assignNumbers;