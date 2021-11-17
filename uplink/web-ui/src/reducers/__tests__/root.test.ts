import { authenticateUserLoading, signOut } from '../../actions';
import store from '../root';

describe('root reducer', () => {
  it('should handle action dispatch and store update', () => {
    store.dispatch(authenticateUserLoading());
    expect(store.getState().auth.isLoading).toEqual(true);
  })

  it('should clear the app state on sign out action', () => {
    store.dispatch(authenticateUserLoading());
    store.dispatch(signOut());
    expect(store.getState().auth.isLoading).toEqual(false);
  })
})