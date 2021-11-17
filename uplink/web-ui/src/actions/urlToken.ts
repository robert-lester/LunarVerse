import { Action } from 'redux';

import client from '../apollo/apolloClient';
import renderFeedback from '../apollo/feedback';
import { NotificationType } from '../components';
import { ThunkResult } from '../types';
import { URLTokenData, URLToken } from '../apollo/types';
import { URLTokenMessaging } from '../constants/messaging';
import { history } from '../App';
import { verifyURLTokenMutation } from '../apollo/mutations';

export interface URLTokenAction extends Action {
  type: URLTokenActionTypes;
  payload?: URLToken | null;
}

export enum URLTokenActionTypes {
  VERIFY_URL_TOKEN_ERROR = 'VERIFY_URL_TOKEN_ERROR',
  VERIFY_URL_TOKEN_LOADING = 'VERIFY_URL_TOKEN_LOADING',
  VERIFY_URL_TOKEN_SUCCESS = 'VERIFY_URL_TOKEN_SUCCESS'
}

/** Verify URL token error */
export const verifyURLTokenError = (): URLTokenAction => ({
  type: URLTokenActionTypes.VERIFY_URL_TOKEN_ERROR
});

/** Verify URL token error */
export const verifyURLTokenLoading = (): URLTokenAction => ({
  type: URLTokenActionTypes.VERIFY_URL_TOKEN_LOADING
});

/** Verify URL token error */
export const verifyURLTokenSuccess = (payload: URLToken): URLTokenAction => ({
  type: URLTokenActionTypes.VERIFY_URL_TOKEN_SUCCESS,
  payload
});

/** Verify URLtoken */
export const verifyURLToken = (token: string): ThunkResult<URLTokenData> => {
  return async (dispatch) => {
    dispatch(verifyURLTokenLoading());
    return client.mutate({
      mutation: verifyURLTokenMutation,
      variables: {
        input: {
          token
        }
      }
    }).then(
      ({ data }) => 
        dispatch(verifyURLTokenSuccess(data.tokenDetail))
      ,
      () => {
        dispatch(verifyURLTokenError());
        renderFeedback([{
          message: URLTokenMessaging.VERIFY_URL_TOKEN_ERROR,
          type: NotificationType.ERROR
        }]);
        // Redirect to login
        history.push('/');
      }
    );
  };
};