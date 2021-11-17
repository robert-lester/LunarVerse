import urlTokenReducer, { urlTokenReducerInitialState } from '../urlToken';
import { URLTokenActionTypes } from '../../actions';

describe('urlToken reducer', () => {
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(urlTokenReducer(urlTokenReducerInitialState, {})).toEqual(urlTokenReducerInitialState)
  })

  it(`should handle ${URLTokenActionTypes.VERIFY_URL_TOKEN_SUCCESS}`, () => {
    const payload = {
      orgSlug: '',
      email: '',
      name: ''
    }
    expect(
      urlTokenReducer(urlTokenReducerInitialState, {
        type: URLTokenActionTypes.VERIFY_URL_TOKEN_SUCCESS,
        payload
      })
    ).toEqual(
      {
        isLoading: false,
        payload
      }
    );
  })

  it(`should handle ${URLTokenActionTypes.VERIFY_URL_TOKEN_ERROR}`, () => {
    expect(
      urlTokenReducer(urlTokenReducerInitialState, {
        type: URLTokenActionTypes.VERIFY_URL_TOKEN_ERROR,
      })
    ).toEqual(
      {
        isLoading: false,
        payload: null
      }
    );
  })

  it(`should handle ${URLTokenActionTypes.VERIFY_URL_TOKEN_LOADING}`, () => {
    expect(
      urlTokenReducer(urlTokenReducerInitialState, {
        type: URLTokenActionTypes.VERIFY_URL_TOKEN_LOADING,
      })
    ).toEqual(
      {
        isLoading: true,
        payload: null
      }
    );
  })
})