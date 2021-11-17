import assignNumbersReducer, { assignNumbersReducerInitialState } from '../assignNumbers';
import { AssignNumbersActionTypes } from '../../actions';
import { UserNumberType } from '../../apollo/types';

describe('assign numbers reducer', () => {
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
  const numberAssignments = [{
    forward: null,
    id: 123,
    messages: [],
    systemNumber: '407-738-7892',
    type: UserNumberType.CONTACT,
    user,
    callOrText30Days: false
  }];
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(assignNumbersReducer(assignNumbersReducerInitialState, {})).toEqual(assignNumbersReducerInitialState)
  })

  it(`should handle ${AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING}`, () => {
    expect(
      assignNumbersReducer(assignNumbersReducerInitialState, {
        type: AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_LOADING
      })
    ).toEqual(
      {
        ...assignNumbersReducerInitialState,
        isSaveNumberAssignmentsLoading: true
      }
    );
  })

  it(`should handle ${AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_SUCCESS}`, () => {
    expect(
      assignNumbersReducer(assignNumbersReducerInitialState, {
        type: AssignNumbersActionTypes.SAVE_NUMBER_ASSIGNMENTS_SUCCESS,
      })
    ).toEqual(
      {
        ...assignNumbersReducerInitialState,
        isSaveNumberAssignmentsLoading: false
      }
    );
  })

  it(`should handle ${AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS}`, () => {
    expect(
      assignNumbersReducer(assignNumbersReducerInitialState, {
        type: AssignNumbersActionTypes.UPDATE_PENDING_NUMBER_ASSIGNMENTS,
        payload: numberAssignments
      })
    ).toEqual(
      {
        ...assignNumbersReducerInitialState,
        pendingNumberAssignments: numberAssignments
      }
    );
  })

  it(`should handle ${AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS}`, () => {
    expect(
      assignNumbersReducer(assignNumbersReducerInitialState, {
        type: AssignNumbersActionTypes.UPDATE_PENDING_UNASSIGNED_USERS,
        payload: [user]
      })
    ).toEqual(
      {
        ...assignNumbersReducerInitialState,
        pendingUnassignedUsers: [user]
      }
    );
  })
})