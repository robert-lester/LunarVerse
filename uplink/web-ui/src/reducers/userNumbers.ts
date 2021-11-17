import { UserNumbersAction, UserNumbersActionTypes } from '../actions';
import { UserNumber } from '../apollo/types';

export interface UserNumbersState {
  readonly allUserNumbers: UserNumber[] | null;
  readonly isAllUserNumbersDataLoading: boolean;
}

export const userNumbersReducerInitialState: UserNumbersState = {
  allUserNumbers: [],
  isAllUserNumbersDataLoading: true
};

const userNumbers = (
  state = userNumbersReducerInitialState,
  action: UserNumbersAction
) => {
  switch (action.type) {
    case UserNumbersActionTypes.SET_ALL_USER_NUMBERS_DATA:
      return {
        ...state,
        allUserNumbers: action.payload,
        isAllUserNumbersDataLoading: false
      };
    case UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_LOADING:
      return {
        ...state,
        isAllUserNumbersDataLoading: true
      };
    case UserNumbersActionTypes.GET_ALL_USER_NUMBERS_DATA_ERROR:
      return {
        ...state,
        isAllUserNumbersDataLoading: false
      };
    default:
      return state;
  }
};

export default userNumbers;