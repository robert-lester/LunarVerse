import authTokenReducer, { authTokenReducerInitialState } from '../authToken';
import { AuthTokenActionTypes } from '../../actions';

describe('authToken reducer', () => {
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(authTokenReducer(authTokenReducerInitialState, {})).toEqual(authTokenReducerInitialState)
  })

  it(`should handle ${AuthTokenActionTypes.REFRESH_AUTH_TOKEN_SUCCESS}`, () => {
    expect(
      authTokenReducer(authTokenReducerInitialState, {
        type: AuthTokenActionTypes.REFRESH_AUTH_TOKEN_SUCCESS,
        payload: 'test'
      })
    ).toEqual(
      {
        isLoading: false,
        payload: 'test'
      }
    );
  })

  it(`should handle ${AuthTokenActionTypes.REFRESH_AUTH_TOKEN_ERROR}`, () => {
    expect(
      authTokenReducer(authTokenReducerInitialState, {
        type: AuthTokenActionTypes.REFRESH_AUTH_TOKEN_ERROR,
      })
    ).toEqual(
      {
        isLoading: false,
        payload: null
      }
    );
  })

  it(`should handle ${AuthTokenActionTypes.REFRESH_AUTH_TOKEN_LOADING}`, () => {
    expect(
      authTokenReducer(authTokenReducerInitialState, {
        type: AuthTokenActionTypes.REFRESH_AUTH_TOKEN_LOADING,
      })
    ).toEqual(
      {
        isLoading: true,
        payload: null
      }
    );
  })
})