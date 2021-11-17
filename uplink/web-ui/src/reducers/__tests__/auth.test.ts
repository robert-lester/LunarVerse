import authReducer, { authReducerInitialState } from '../auth';
import { AuthActionTypes } from '../../actions';

describe('auth reducer', () => {
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(authReducer(authReducerInitialState, {})).toEqual(authReducerInitialState)
  })

  it(`should handle ${AuthActionTypes.AUTHENTICATE_USER_SUCCESS}`, () => {
    expect(
      authReducer(authReducerInitialState, {
        type: AuthActionTypes.AUTHENTICATE_USER_SUCCESS
      })
    ).toEqual(
      {
        isLoading: false,
        payload: true
      }
    );
  })

  it(`should handle ${AuthActionTypes.AUTHENTICATE_USER_ERROR}`, () => {
    expect(
      authReducer(authReducerInitialState, {
        type: AuthActionTypes.AUTHENTICATE_USER_ERROR,
      })
    ).toEqual(
      {
        isLoading: false,
        payload: null
      }
    );
  })

  it(`should handle ${AuthActionTypes.AUTHENTICATE_USER_LOADING}`, () => {
    expect(
      authReducer(authReducerInitialState, {
        type: AuthActionTypes.AUTHENTICATE_USER_LOADING,
      })
    ).toEqual(
      {
        isLoading: true,
        payload: null
      }
    );
  })
})