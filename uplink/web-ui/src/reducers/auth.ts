import { AuthActionTypes, AuthAction } from '../actions';

export interface AuthState {
  readonly payload: boolean | null;
  readonly isLoading: boolean;
}

export const authReducerInitialState: AuthState = {
  payload: null,
  isLoading: false
};

const authReducer = (
  state = authReducerInitialState,
  action: AuthAction
) => {
  switch (action.type) {
    case AuthActionTypes.AUTHENTICATE_USER_SUCCESS:
      return {
        ...state,
        payload: true,
        isLoading: false
      }
    case AuthActionTypes.AUTHENTICATE_USER_ERROR:
    case AuthActionTypes.RESEND_MFA_CODE_SUCCESS:
    case AuthActionTypes.RESEND_MFA_CODE_ERROR:
    case AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_SUCCESS:
    case AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_ERROR:
    case AuthActionTypes.RESET_PASSWORD_SUCCESS:
    case AuthActionTypes.RESET_PASSWORD_ERROR:
    case AuthActionTypes.REGISTER_PHONE_NUMBER_SUCCESS:
    case AuthActionTypes.REGISTER_PHONE_NUMBER_ERROR:
      return {
        ...state,
        isLoading: false
      };
    case AuthActionTypes.AUTHENTICATE_USER_LOADING:
    case AuthActionTypes.RESEND_MFA_CODE_LOADING:
    case AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_LOADING:
    case AuthActionTypes.RESET_PASSWORD_LOADING:
    case AuthActionTypes.REGISTER_PHONE_NUMBER_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case AuthActionTypes.SIGN_OUT:
      return {
        ...state,
        payload: false
      }
    default:
      return state;
  }
};

export default authReducer;