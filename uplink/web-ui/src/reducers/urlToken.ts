import { URLTokenActionTypes, URLTokenAction } from '../actions';
import { URLToken } from '../apollo/types';

export interface URLTokenState {
  readonly payload: URLToken | null;
  readonly isLoading: boolean;
}

export const urlTokenReducerInitialState: URLTokenState = {
  payload: null,
  isLoading: false
};

const urlTokenReducer = (
  state = urlTokenReducerInitialState,
  action: URLTokenAction
) => {
  switch (action.type) {
    case URLTokenActionTypes.VERIFY_URL_TOKEN_SUCCESS:
      return {
        ...state,
        payload: action.payload,
        isLoading: false
      }
    case URLTokenActionTypes.VERIFY_URL_TOKEN_ERROR:
      return {
        ...state,
        isLoading: false
      };
    case URLTokenActionTypes.VERIFY_URL_TOKEN_LOADING:
      return {
        ...state,
        isLoading: true
      };
    default:
      return state;
  }
};

export default urlTokenReducer;