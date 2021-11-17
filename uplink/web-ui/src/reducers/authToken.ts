import { AuthTokenActionTypes, AuthTokenAction } from '../actions/authToken';
import { AuthToken } from '../apollo/types';

export interface AuthTokenState {
  readonly payload: AuthToken | null;
  readonly isLoading: boolean;
}

export const authTokenReducerInitialState: AuthTokenState = {
  payload: null,
  isLoading: false
};

const authTokenReducer = (
  state = authTokenReducerInitialState,
  action: AuthTokenAction
) => {
  switch (action.type) {
    case AuthTokenActionTypes.REFRESH_AUTH_TOKEN_SUCCESS:
      return {
        ...state,
        payload: action.payload,
        isLoading: false
      }
    case AuthTokenActionTypes.REFRESH_AUTH_TOKEN_ERROR:
      return {
        ...state,
        payload: null,
        isLoading: false
      };
    case AuthTokenActionTypes.REFRESH_AUTH_TOKEN_LOADING:
      return {
        ...state,
        isLoading: true
      };
    default:
      return state;
  }
};

export default authTokenReducer;