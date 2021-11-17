import { Action } from 'redux';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { AuthTokenData, AuthToken } from '../apollo/types';
import { AuthTokenMessaging } from '../constants/messaging';
import { NotificationType } from '../components';
import { ThunkResult } from '../types';
import { authenticateUserSuccess, signOut } from './auth';
import { refreshTokenMutation } from '../apollo/mutations';

export interface AuthTokenAction extends Action {
  type: AuthTokenActionTypes;
  payload?: AuthToken;
}

export enum AuthTokenActionTypes {
  REFRESH_AUTH_TOKEN_ERROR = 'REFRESH_AUTH_TOKEN_ERROR',
  REFRESH_AUTH_TOKEN_LOADING = 'REFRESH_AUTH_TOKEN_LOADING',
  REFRESH_AUTH_TOKEN_SUCCESS = 'REFRESH_AUTH_TOKEN_SUCCESS'
}

/** Verify URL token error */
export const refreshAuthTokenError = (): AuthTokenAction => ({
  type: AuthTokenActionTypes.REFRESH_AUTH_TOKEN_ERROR
});

/** Verify URL token error */
export const refreshAuthTokenLoading = (): AuthTokenAction => ({
  type: AuthTokenActionTypes.REFRESH_AUTH_TOKEN_LOADING
});

/** Verify URL token error */
export const refreshAuthTokenSuccess = (payload: AuthToken): AuthTokenAction => ({
  type: AuthTokenActionTypes.REFRESH_AUTH_TOKEN_SUCCESS,
  payload
});

/** Refresh auth token */
export const refreshAuthToken = (): ThunkResult<AuthTokenData> => {
  return async (dispatch) => {
    dispatch(refreshAuthTokenLoading());
    return client.mutate({
      mutation: refreshTokenMutation,
      variables: {
        input: {
          orgSlug: sessionStorage.getItem('uplinkOrgSlug'),
          refreshToken: sessionStorage.getItem('refreshToken')
        }
      }
    }).then(
      ({ data }) => {
        sessionStorage.setItem('uplinkAuth', data.tokenDetail.accessToken);
        dispatch(authenticateUserSuccess());
        dispatch(refreshAuthTokenSuccess(data.tokenDetail.accessToken))
      },
      () => {
        dispatch(signOut());
        dispatch(refreshAuthTokenError());
        renderFeedback([{
          message: AuthTokenMessaging.REFRESH_AUTH_TOKEN_ERROR,
          type: NotificationType.ERROR
        }]);
      }
    );
  };
};