import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk'

import * as urlTokenActions from '../urlToken';
import root from '../../reducers/root';
import { URLTokenActionTypes } from '../urlToken';

describe('URL token actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set verification of url token to success', () => {
    const tokenData = {
      orgSlug: '',
      email: '',
      name:''
    }
    expect(urlTokenActions.verifyURLTokenSuccess(tokenData).type).toEqual(URLTokenActionTypes.VERIFY_URL_TOKEN_SUCCESS)
  });

  it('should create an action to set verification of url token to error', () => {
    expect(urlTokenActions.verifyURLTokenError().type).toEqual(URLTokenActionTypes.VERIFY_URL_TOKEN_ERROR)
  });

  it('should create an action to set verification of url token to loading', () => {
    expect(urlTokenActions.verifyURLTokenLoading().type).toEqual(URLTokenActionTypes.VERIFY_URL_TOKEN_LOADING)
  });

  it('should dispatch actions for verify url token success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { tokenDetail: {} } }));
    // @ts-ignore
    return store.dispatch(urlTokenActions.verifyURLToken('test')).then(() => {
      const expectedActions = [
        URLTokenActionTypes.VERIFY_URL_TOKEN_LOADING,
        URLTokenActionTypes.VERIFY_URL_TOKEN_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for verify url token error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { tokenDetail: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(urlTokenActions.verifyURLToken('test')).then(() => {
      const expectedActions = [
        URLTokenActionTypes.VERIFY_URL_TOKEN_LOADING,
        URLTokenActionTypes.VERIFY_URL_TOKEN_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});