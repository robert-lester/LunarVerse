import { UserActionTypes, UserAction } from '../actions';
import { UserToEdit } from '../pages/AssignNumbers/components/EditUser';
import { UserToDelete } from '../pages/AssignNumbers/components/DeleteUser';
import { UserNumber, User } from '../apollo/types';

export interface UserState {
  readonly isCreateNewUserLoading: boolean;
  readonly isDeleteUserLoading: boolean;
  readonly isDeleteUserModalOpen: false;
  readonly isEditUserModalOpen: boolean;
  readonly isNewUserModalOpen: boolean;
  readonly isUserDataLoading: boolean;
  readonly toAssign: UserNumber | null;
  readonly toDelete: UserToDelete;
  readonly toEdit: UserToEdit;
  readonly userData: User | null;
}

export const userReducerInitialState: UserState = {
  isCreateNewUserLoading: false,
  isDeleteUserLoading: false,
  isDeleteUserModalOpen: false,
  isEditUserModalOpen: false,
  isNewUserModalOpen: false,
  isUserDataLoading: false,
  toAssign: null,
  toDelete: {
    name: '',
    id: 0
  },
  toEdit: {
    name: '',
    phone: '',
    id: 0
  },
  userData: null
};

const user = (
  state = userReducerInitialState,
  action: UserAction
) => {
  switch (action.type) {
    case UserActionTypes.DELETE_USER_LOADING:
      return {
        ...state,
        isDeleteUserLoading: true
      };
    case UserActionTypes.DELETE_USER_SUCCESS:
      return {
        ...state,
        isDeleteUserLoading: false,
        isEditUserModalOpen: false
      };
    case UserActionTypes.TOGGLE_NEW_USER_MODAL:
      return {
        ...state,
        isNewUserModalOpen: !state.isNewUserModalOpen
      };
    case UserActionTypes.TOGGLE_EDIT_USER_MODAL:
      return {
        ...state,
        isEditUserModalOpen: !state.isEditUserModalOpen,
        toEdit: action.payload || {}
      };
    case UserActionTypes.TOGGLE_DELETE_USER_MODAL:
      return {
        ...state,
        isDeleteUserModalOpen: !state.isDeleteUserModalOpen,
        toDelete: action.payload || {}
      };
    case UserActionTypes.TOGGLE_WILL_ASSIGN_NEW_USER:
      return {
        ...state,
        toAssign: state.toAssign ? null : action.payload
      };
    case UserActionTypes.CLOSE_DELETE_USER_MODAL:
      return {
        ...state,
        isDeleteUserModalOpen: false
      };
    case UserActionTypes.CREATE_NEW_USER_LOADING:
      return {
        ...state,
        isCreateNewUserLoading: true
      };
    case UserActionTypes.CREATE_NEW_USER_SUCCESS:
      return {
        ...state,
        isCreateNewUserLoading: false
      };
    case UserActionTypes.SET_USER_DATA:
      return {
        ...state,
        userData: action.payload,
        isUserDataLoading: false
      };
    case UserActionTypes.GET_USER_DATA_ERROR:
      return {
        ...state,
        isUserDataLoading: false
      };
    default:
      return state;
  }
};

export default user;