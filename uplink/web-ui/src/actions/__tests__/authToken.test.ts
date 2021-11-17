import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as authTokenActions from '../authToken';
import root from '../../reducers/root';
import { AuthTokenActionTypes } from '../authToken';
import { AuthActionTypes } from '../auth';

describe('Auth token actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set refresh auth token to success', () => {
    expect(authTokenActions.refreshAuthTokenSuccess('').type).toEqual(AuthTokenActionTypes.REFRESH_AUTH_TOKEN_SUCCESS)
  });

  it('should create an action to set refresh auth token to loading', () => {
    expect(authTokenActions.refreshAuthTokenLoading().type).toEqual(AuthTokenActionTypes.REFRESH_AUTH_TOKEN_LOADING)
  });

  it('should create an action to set refresh auth token to error', () => {
    expect(authTokenActions.refreshAuthTokenError().type).toEqual(AuthTokenActionTypes.REFRESH_AUTH_TOKEN_ERROR)
  });

  it('should dispatch actions for refresh auth token success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { tokenDetail: {} } }));
    // @ts-ignore
    return store.dispatch(authTokenActions.refreshAuthToken()).then(() => {
      const expectedActions = [
        AuthTokenActionTypes.REFRESH_AUTH_TOKEN_LOADING,
        AuthActionTypes.AUTHENTICATE_USER_SUCCESS,
        AuthTokenActionTypes.REFRESH_AUTH_TOKEN_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for refresh auth token error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { tokenDetail: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(authTokenActions.refreshAuthToken()).then(() => {
      const expectedActions = [
        AuthTokenActionTypes.REFRESH_AUTH_TOKEN_LOADING,
        AuthActionTypes.SIGN_OUT,
        AuthTokenActionTypes.REFRESH_AUTH_TOKEN_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});