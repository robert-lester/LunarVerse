import userReducer, { userReducerInitialState } from '../user';
import { UserActionTypes } from '../../actions';
import { UserNumberType } from '../../apollo/types';

describe('user reducer', () => {
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
  const userNumber = {
    forward: null,
    id: 123,
    messages: [],
    systemNumber: '407-738-7892',
    type: UserNumberType.CONTACT,
    user,
    callOrText30Days: false
  };

  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(userReducer(userReducerInitialState, {})).toEqual(userReducerInitialState)
  })

  it(`should handle ${UserActionTypes.DELETE_USER_LOADING}`, () => {
    expect(
      userReducer(userReducerInitialState, {
        type: UserActionTypes.DELETE_USER_LOADING
      })
    ).toEqual(
      {
        ...userReducerInitialState,
        isDeleteUserLoading: true
      }
    );
  })

  it(`should handle ${UserActionTypes.DELETE_USER_SUCCESS}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.DELETE_USER_SUCCESS
    })).toEqual(
      {
        ...userReducerInitialState,
        isDeleteUserLoading: false,
        isEditUserModalOpen: false
      }
    )
  })

  it(`should handle ${UserActionTypes.TOGGLE_NEW_USER_MODAL}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.TOGGLE_NEW_USER_MODAL
    })).toEqual(
      {
        ...userReducerInitialState,
        isNewUserModalOpen: true
      }
    )
  })

  it(`should handle ${UserActionTypes.TOGGLE_EDIT_USER_MODAL}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.TOGGLE_EDIT_USER_MODAL
    })).toEqual(
      {
        ...userReducerInitialState,
        isEditUserModalOpen: true,
        toEdit: {}
      }
    )
  })

  it(`should handle ${UserActionTypes.TOGGLE_DELETE_USER_MODAL}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.TOGGLE_DELETE_USER_MODAL
    })).toEqual(
      {
        ...userReducerInitialState,
        isDeleteUserModalOpen: true,
        toDelete: {}
      }
    )
  })

  it(`should handle ${UserActionTypes.TOGGLE_WILL_ASSIGN_NEW_USER}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.TOGGLE_WILL_ASSIGN_NEW_USER,
      payload: userNumber
    })).toEqual(
      {
        ...userReducerInitialState,
        toAssign: userNumber
      }
    )
  })

  it(`should handle ${UserActionTypes.CLOSE_DELETE_USER_MODAL}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.CLOSE_DELETE_USER_MODAL
    })).toEqual(
      {
        ...userReducerInitialState,
        isDeleteUserModalOpen: false
      }
    )
  })

  it(`should handle ${UserActionTypes.CREATE_NEW_USER_LOADING}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.CREATE_NEW_USER_LOADING
    })).toEqual(
      {
        ...userReducerInitialState,
        isCreateNewUserLoading: true
      }
    )
  })

  it(`should handle ${UserActionTypes.CREATE_NEW_USER_SUCCESS}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.CREATE_NEW_USER_SUCCESS
    })).toEqual(
      {
        ...userReducerInitialState,
        isCreateNewUserLoading: false
      }
    )
  })

  it(`should handle ${UserActionTypes.SET_USER_DATA}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.SET_USER_DATA,
      payload: user
    })).toEqual(
      {
        ...userReducerInitialState,
        userData: user,
        isUserDataLoading: false
      }
    )
  })

  it(`should handle ${UserActionTypes.GET_USER_DATA_ERROR}`, () => {
    expect(userReducer(userReducerInitialState, {
      type: UserActionTypes.GET_USER_DATA_ERROR
    })).toEqual(
      {
        ...userReducerInitialState,
        isUserDataLoading: false
      }
    )
  })
})