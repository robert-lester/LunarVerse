import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk'

import * as assignNumbersActions from '../assignNumbers';
import { AssignNumbersActionTypes } from "../assignNumbers";
import { UserNumberType } from '../../apollo/types';
import { createNotificationElement, userNumberMock, userMock } from '../../utils/mocks';
import { assignNumbersReducerInitialState } from '../../reducers';

describe('Assign Numbers actions', () => {
  let mockStore: any;
  let store: MockStoreEnhanced<any>;
  const state = {
    assignNumbers: {
      ...assignNumbersReducerInitialState,
      pendingNumberAssignments: [userNumberMock]
    },
    users: {
      unassignedUsers: [{ ...userMock, name: 'Test Name 2' }]
    },
    userNumbers: {
      allUserNumbers: [{ ...userNumberMock, forward: {} }]
    }
  }
  beforeAll(() => {
    createNotificationElement();
  });

  beforeEach(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(state);
  })

  afterEach(() => {
    store.clearActions();
  });

  it('should get an assigned Id', () => {
    expect(assignNumbersActions.getAssignedId(userNumberMock)).toEqual(2)
  });

  it('should get an assignment type', () => {
    expect(assignNumbersActions.getAssignmentType(userNumberMock)).toEqual(UserNumberType.USER)
  });

  it('should get assignment users as an empty array', () => {
    expect(assignNumbersActions.getAssignmentUsers(null)).toEqual([])
  });

  it('should create an action to set saving of number assignments to success', () => {
    expect(assignNumbersActions.saveNumberAssignmentsSuccess().type).toEqual(AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_SUCCESS)
  });

  it('should create an action to set saving of number assignments to error', () => {
    expect(assignNumbersActions.saveNumberAssignmentsError().type).toEqual(AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_ERROR)
  });

  it('should create an action to set saving of number assignments to loading', () => {
    expect(assignNumbersActions.saveNumberAssignmentsLoading().type).toEqual(AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING)
  });

  it('should not dispatch actions for save number assignments', () => {
    store = configureStore([thunk])(
      {
        ...state,
        assignNumbers: {
          ...state.assignNumbers,
          pendingNumberAssignments: []
        }
      }
    );
    // @ts-ignore
    return store.dispatch(assignNumbersActions.saveNumberAssignments()).then(() => {
      expect(store.getActions().map(action => action.type)).toEqual([]);
    });
  });

  it('should dispatch actions for save number assignments success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { updatePhoneNumbers: {} } }));
    // @ts-ignore
    return store.dispatch(assignNumbersActions.saveNumberAssignments()).then(() => {
      const expectedActions = [
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING,
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for save number assignments error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { updatePhoneNumbers: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(assignNumbersActions.saveNumberAssignments()).then(() => {
      const expectedActions = [
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING,
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should not dispatch actions for save users ', () => {
    store = configureStore([thunk])(
      {
        ...state,
        assignNumbers: {
          ...state.assignNumbers,
          pendingNumberAssignments: []
        }
      }
    );
    // @ts-ignore
    return store.dispatch(assignNumbersActions.saveUsers()).then(() => {
      expect(store.getActions().map(action => action.type)).toEqual([]);
    });
  });

  it('should dispatch actions for save users success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { updateUsers: {} } }));
    // @ts-ignore
    return store.dispatch(assignNumbersActions.saveUsers()).then(() => {
      const expectedActions = [
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING,
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for save users error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { updateUsers: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(assignNumbersActions.saveUsers()).then(() => {
      const expectedActions = [
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING,
        AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should create an action to update pending number assignments', () => {
    const expectedAction = {
      type: AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS,
      payload: [userNumberMock]
    }
    expect(assignNumbersActions.updatePendingNumberAssignments([userNumberMock])).toEqual(expectedAction)
  });

  it('should create an action to update pending unassigned users', () => {
    const user = {
      color: '',
      directDialNumber: '',
      id: 2,
      name: '',
      phoneNumber: null,
      physicalNumber: '',
      systemNumber: '',
      type: UserNumberType.USER
    };
    const expectedAction = {
      type: AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS,
      payload: [user]
    }
    expect(assignNumbersActions.updatePendingUnassignedUsers([user])).toEqual(expectedAction)
  });

  it('should create an action to discard pending number assignments', () => {
    // @ts-ignore
    store.dispatch(assignNumbersActions.discardPendingNumberAssignments()).then(() => {
      const expectedActions = [
        AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS,
        AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});