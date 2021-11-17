import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as userActions from '../user';
import { UserActionTypes } from '../user';
import { UserNumberType } from '../../apollo/types';
import root from '../../reducers/root';
import { AssignNumbersActionTypes } from '../assignNumbers';

describe('User actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  const user = {
    color: 'blue',
    directDialNumber: '1234567788',
    id: 2,
    name: 'Test',
    phoneNumber: null,
    physicalNumber: '1123345566',
    systemNumber: '2223334455',
    type: UserNumberType.USER
  };
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to toggle delete user modal', () => {
    const expectedAction = {
      type: UserActionTypes.TOGGLE_DELETE_USER_MODAL
    }
    expect(userActions.toggleDeleteUserModal()).toEqual(expectedAction)
  });

  it('should create an action to close delete user modal', () => {
    const expectedAction = {
      type: UserActionTypes.CLOSE_DELETE_USER_MODAL
    }
    expect(userActions.closeDeleteUserModal()).toEqual(expectedAction)
  });

  it('should create an action to toggle new user modal', () => {
    const expectedAction = {
      type: UserActionTypes.TOGGLE_NEW_USER_MODAL
    }
    expect(userActions.toggleNewUserModal()).toEqual(expectedAction)
  });

  it('should create an action to toggle edit user modal', () => {
    const expectedAction = {
      type: UserActionTypes.TOGGLE_EDIT_USER_MODAL
    }
    expect(userActions.toggleEditUserModal()).toEqual(expectedAction)
  });

  it('should create an action to toggle will assign new user', () => {
    const expectedAction = {
      type: UserActionTypes.TOGGLE_WILL_ASSIGN_NEW_USER
    }
    expect(userActions.toggleWillAssignNewUser()).toEqual(expectedAction)
  });

  it('should create an action to set deletion of user to success', () => {
    const expectedAction = {
      type: UserActionTypes.DELETE_USER_SUCCESS
    }
    expect(userActions.deleteUserSuccess()).toEqual(expectedAction)
  });

  it('should create an action to set deletion of user to loading', () => {
    const expectedAction = {
      type: UserActionTypes.DELETE_USER_LOADING
    }
    expect(userActions.deleteUserLoading()).toEqual(expectedAction)
  });

  it('should create an action to set creation of new user to success', () => {
    const expectedAction = {
      type: UserActionTypes.CREATE_NEW_USER_SUCCESS
    }
    expect(userActions.createNewUserSuccess()).toEqual(expectedAction)
  });

  it('should create an action to set creation of new user to loading', () => {
    const expectedAction = {
      type: UserActionTypes.CREATE_NEW_USER_LOADING
    }
    expect(userActions.createNewUserLoading()).toEqual(expectedAction)
  });

  it('should create an action to set get of user data to error', () => {
    const expectedAction = {
      type: UserActionTypes.GET_USER_DATA_ERROR
    }
    expect(userActions.getUserDataError()).toEqual(expectedAction)
  });

  it('should create an action to set user data', () => {
    const expectedAction = {
      type: UserActionTypes.SET_USER_DATA,
      payload: user
    }
    expect(userActions.setUserData(user)).toEqual(expectedAction)
  });

  it('should create an action to delete user', () => {
    // @ts-ignore
    store.dispatch(userActions.deleteUser()).then(() => {
      const expectedActions = [
        {
          type: UserActionTypes.DELETE_USER_LOADING
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to assign user', () => {
    const userNumber = {
      forward: null,
      id: 123,
      messages: [],
      systemNumber: '407-738-7892',
      type: UserNumberType.CONTACT,
      user: {
        color: 'blue',
        directDialNumber: '1234567788',
        id: 2,
        name: 'Test',
        phoneNumber: null,
        physicalNumber: '1123345566',
        systemNumber: '2223334455',
        type: UserNumberType.USER
      },
      callOrText30Days: false
    };
    // @ts-ignore
    store.dispatch(userActions.assignUser(user, userNumber)).then(() => {
      const expectedActions = [
        {
          type: AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS,
          payload: []
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to unassign user', () => {
    // @ts-ignore
    store.dispatch(userActions.unassignUser(user)).then(() => {
      const expectedActions = [
        {
          type: AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS,
          payload: []
        },
        {
          type: AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS,
          payload: []
        }
      ];
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to create new user', () => {
    const payload = {
      name: '',
      physicalNumber: ''
    }
    // @ts-ignore
    store.dispatch(userActions.createNewUser(payload)).then(() => {

      expect(store.getActions()).toEqual([]);
    });
  });

  it('should create an action to update user', () => {
    const expectedActions = [
      {
        type: UserActionTypes.TOGGLE_EDIT_USER_MODAL,
        payload: undefined
      },
      {
        type: AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS,
        payload: []
      },
      {
        type: AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS,
        payload: []
      },
    ];
    // @ts-ignore
    store.dispatch(userActions.updateUser()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should create an action to get user data', () => {
    // @ts-ignore
    store.dispatch(userActions.getUserData()).then(() => {
      expect(store.getActions()).toEqual([]);
    });
  });
});