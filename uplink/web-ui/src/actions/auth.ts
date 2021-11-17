import { Action } from 'redux';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { AuthData, ResendMFAData, RegisterPhoneNumberData } from '../apollo/types';
import { AuthResponse } from '../auth/types';
import { AuthenticationMessaging, GeneralMessaging } from '../constants/messaging';
import { NotificationType } from '../components';
import { ThunkResult } from '../types';
import { history } from '../App';
import { resendMFACodeMutation, sendResetPasswordEmailMutation, resetPasswordMutation, authenticateUserMutation, registerPhoneNumberMutation } from '../apollo/mutations';
import { refreshAuthTokenSuccess } from './authToken';

export interface AuthAction extends Action {
  type: AuthActionTypes;
  payload?: AuthData;
}

export enum AuthActionTypes {
  RESEND_MFA_CODE = 'RESEND_MFA_CODE',
  RESEND_MFA_CODE_SUCCESS = 'RESEND_MFA_CODE_SUCCESS',
  RESEND_MFA_CODE_ERROR = 'RESEND_MFA_CODE_ERROR',
  RESEND_MFA_CODE_LOADING = 'RESEND_MFA_CODE_LOADING',
  SEND_RESET_PASSWORD_EMAIL_SUCCESS = 'SEND_RESET_PASSWORD_EMAIL_SUCCESS',
  SEND_RESET_PASSWORD_EMAIL_ERROR = 'SEND_RESET_PASSWORD_EMAIL_ERROR',
  SEND_RESET_PASSWORD_EMAIL_LOADING = 'SEND_RESET_PASSWORD_EMAIL_LOADING',
  RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_ERROR = 'RESET_PASSWORD_ERROR',
  RESET_PASSWORD_LOADING = 'RESET_PASSWORD_LOADING',
  AUTHENTICATE_USER_SUCCESS = 'AUTHENTICATE_USER_SUCCESS',
  AUTHENTICATE_USER_ERROR = 'AUTHENTICATE_USER_ERROR',
  AUTHENTICATE_USER_LOADING = 'AUTHENTICATE_USER_LOADING',
  REGISTER_PHONE_NUMBER_SUCCESS = 'REGISTER_PHONE_NUMBER_SUCCESS',
  REGISTER_PHONE_NUMBER_ERROR = 'REGISTER_PHONE_NUMBER_ERROR',
  REGISTER_PHONE_NUMBER_LOADING = 'REGISTER_PHONE_NUMBER_LOADING',
  SIGN_OUT = 'SIGN_OUT'
}

/** Resend MFA code loading state */
export const resendMFACodeLoading = (): AuthAction => ({
  type: AuthActionTypes.RESEND_MFA_CODE_LOADING
});

/** Resend MFA code success */
export const resendMFACodeSuccess = (): AuthAction => ({
  type: AuthActionTypes.RESEND_MFA_CODE_SUCCESS
});

/** Resend MFA code error */
export const resendMFACodeError = (): AuthAction => ({
  type: AuthActionTypes.RESEND_MFA_CODE_ERROR
});

/** Resend MFA code */
export const resendMFACode = (payload: AuthData): ThunkResult<null> => {
  return async (dispatch) => {
    dispatch(resendMFACodeLoading());
    return client.mutate({
      mutation: resendMFACodeMutation,
      variables: {
        input: payload
      }
    }).then(
      result => {
        const { resendMFA: { session } } = result.data as ResendMFAData;
        sessionStorage.setItem('session', session);
        dispatch(resendMFACodeSuccess());
        renderFeedback([{
          message: AuthenticationMessaging.RESEND_MFA_CODE_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      ({ networkError: { result } }) => {
        let errorMessage = AuthenticationMessaging.RESEND_MFA_CODE_ERROR;
        if (result && result.statusCode === 423) {
          errorMessage = AuthenticationMessaging.TOO_MANY_ATTEMPTS;
        }
        dispatch(resendMFACodeError());
        renderFeedback([{
          message: errorMessage,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Send reset password email loading state */
export const sendResetPasswordEmailLoading = (): AuthAction => ({
  type: AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_LOADING
});

/** Send reset password email success */
export const sendResetPasswordEmailSuccess = (): AuthAction => ({
  type: AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_SUCCESS
});

/** Send reset password email error */
export const sendResetPasswordEmailError = (): AuthAction => ({
  type: AuthActionTypes.SEND_RESET_PASSWORD_EMAIL_ERROR
});

/** Send reset password email */
export const sendResetPasswordEmail = (payload: AuthData): ThunkResult<null> => {
  return async (dispatch) => {
    dispatch(sendResetPasswordEmailLoading());
    return client.mutate({
      mutation: sendResetPasswordEmailMutation,
      variables: {
        input: payload
      }
    }).then(
      () => {
        dispatch(sendResetPasswordEmailSuccess());
        renderFeedback([{
          message: AuthenticationMessaging.SEND_RESET_PASSWORD_EMAIL_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      ({ message }) => {
        // IMPORTANT! This is a workaround for 200 with empty response payload.
        // The solution below is highly open to false positives
        // TODO: Follow-up on library to see if fix is provided
        const emptyBodyMessaging = [
          'The string did not match the expected pattern.',
          'Unexpected end of JSON input',
          'JSON.parse: unexpected end of data'
        ];
        if (emptyBodyMessaging.find(messaging => message.includes(messaging))) {
          dispatch(sendResetPasswordEmailSuccess());
          renderFeedback([{
            message: AuthenticationMessaging.SEND_RESET_PASSWORD_EMAIL_SUCCESS,
            type: NotificationType.SUCCESS
          }]);
          return;
        }
        dispatch(sendResetPasswordEmailError());
        renderFeedback([{
          message: AuthenticationMessaging.SEND_RESET_PASSWORD_EMAIL_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Authenticate user loading state */
export const authenticateUserLoading = (): AuthAction => ({
  type: AuthActionTypes.AUTHENTICATE_USER_LOADING
});

/** Authenticate user success */
export const authenticateUserSuccess = (): AuthAction => ({
  type: AuthActionTypes.AUTHENTICATE_USER_SUCCESS
});

/** Authenticate user error */
export const authenticateUserError = (): AuthAction => ({
  type: AuthActionTypes.AUTHENTICATE_USER_ERROR
});
/** Authenticate user */
export const authenticateUser = (payload: AuthData): ThunkResult<null> => {
  return async (dispatch) => {
    dispatch(authenticateUserLoading());
    return client.mutate({
      mutation: authenticateUserMutation,
      variables: {
        input: payload
      }
    }).then(
      result => {
        const { tokenDetail: { accessToken, refreshToken, status, session } } = result.data as AuthResponse;
        if (status === 'MFAMethodNotFound') {
          history.push('/?type=registerPhoneNumber');
        } else if (status === 'MFARequired') {
          sessionStorage.setItem('session', session as string);
          history.push('/?type=multiFactorAuth');
        } else {
          // Set session storage for token TTL and auth header
          sessionStorage.setItem('uplinkAuth', accessToken);
          sessionStorage.setItem('refreshToken', refreshToken);
          dispatch(authenticateUserSuccess());
          dispatch(refreshAuthTokenSuccess(accessToken));
        }
      },
      ({ networkError: { result } }) => {
        let errorMessage: string | GeneralMessaging | AuthenticationMessaging = GeneralMessaging.UNKNOWN_ERROR;
        if (result) {
          if (result.statusCode === 401) {
            errorMessage = `Invalid organization name, email address, or password. You have ${result.attempts_remaining} login attempts remaining.`;
          } else if (result.statusCode === 423) {
            errorMessage = AuthenticationMessaging.TOO_MANY_ATTEMPTS;
          }
        }
        renderFeedback([{
          message: errorMessage,
          type: NotificationType.ERROR
        }]);
        dispatch(authenticateUserError());
      }
    );
  };
};

/** Reset password loading state */
export const resetPasswordLoading = (): AuthAction => ({
  type: AuthActionTypes.RESET_PASSWORD_LOADING
});

/** Reset password success */
export const resetPasswordSuccess = (): AuthAction => ({
  type: AuthActionTypes.RESET_PASSWORD_SUCCESS
});

/** Reset password error */
export const resetPasswordError = (): AuthAction => ({
  type: AuthActionTypes.RESET_PASSWORD_ERROR
});

/** Reset password */
export const resetPassword = (payload: AuthData): ThunkResult<null> => {
  return async (dispatch) => {
    dispatch(resetPasswordLoading());
    return client.mutate({
      mutation: resetPasswordMutation,
      variables: {
        input: payload
      }
    }).then(
      () => {
        dispatch(resetPasswordSuccess());
        renderFeedback([{
          message: AuthenticationMessaging.RESET_PASSWORD_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
        const { confirmationCode, confirmPassword, ...rest } = payload;
        dispatch(authenticateUser(rest));
      },
      () => {
        dispatch(resetPasswordError());
        renderFeedback([{
          message: AuthenticationMessaging.RESET_PASSWORD_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Register phone number loading state */
export const registerPhoneNumberLoading = (): AuthAction => ({
  type: AuthActionTypes.REGISTER_PHONE_NUMBER_LOADING
});

/** Register phone number success */
export const registerPhoneNumberSuccess = (): AuthAction => ({
  type: AuthActionTypes.REGISTER_PHONE_NUMBER_SUCCESS
});

/** Register phone number error */
export const registerPhoneNumberError = (): AuthAction => ({
  type: AuthActionTypes.REGISTER_PHONE_NUMBER_ERROR
});

/** Register phone number */
export const registerPhoneNumber = (payload: AuthData): ThunkResult<null> => {
  return async (dispatch) => {
    dispatch(registerPhoneNumberLoading());
    return client.mutate({
      mutation: registerPhoneNumberMutation,
      variables: {
        input: payload
      }
    }).then(
      result => {
        const { numberRegistration: { session } } = result.data as RegisterPhoneNumberData;
        sessionStorage.setItem('session', session);
        history.push('/?type=multiFactorAuth');
        dispatch(registerPhoneNumberSuccess());
        renderFeedback([{
          message: AuthenticationMessaging.REGISTER_PHONE_NUMBER_SUCCESS,
          type: NotificationType.SUCCESS
        }]);
      },
      () => {
        dispatch(registerPhoneNumberError());
        renderFeedback([{
          message: AuthenticationMessaging.REGISTER_PHONE_NUMBER_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};

/** Signs out the user */
export const signOut = (): AuthAction => {
  sessionStorage.clear();
  return {
    type: AuthActionTypes.SIGN_OUT
  };
};
