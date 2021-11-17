import sfModulesReducer, { sfModulesReducerInitialState } from '../sfModules';
import { SfModulesActionTypes } from '../../actions';

describe('sf modules reducer', () => {
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(sfModulesReducer(sfModulesReducerInitialState, {})).toEqual(sfModulesReducerInitialState)
  })

  it(`should handle ${SfModulesActionTypes.START_CONVERSATION_LOADING}`, () => {
    expect(
      sfModulesReducer(sfModulesReducerInitialState, {
        type: SfModulesActionTypes.START_CONVERSATION_LOADING
      })
    ).toEqual(
      {
        ...sfModulesReducerInitialState,
        isStartConversationLoading: true
      }
    );
  })

  it(`should handle ${SfModulesActionTypes.START_CONVERSATION_SUCCESS}`, () => {
    const payload = {
      createContact: {
        systemNumber: ''
      }
    };
    expect(
      sfModulesReducer(sfModulesReducerInitialState, {
        type: SfModulesActionTypes.START_CONVERSATION_SUCCESS,
        payload
      })
    ).toEqual(
      {
        ...sfModulesReducerInitialState,
        isStartConversationLoading: false,
        systemNumber: ''
      }
    );
  })

  it(`should handle ${SfModulesActionTypes.START_CONVERSATION_ERROR}`, () => {
    expect(
      sfModulesReducer(sfModulesReducerInitialState, {
        type: SfModulesActionTypes.START_CONVERSATION_ERROR,
      })
    ).toEqual(
      {
        ...sfModulesReducerInitialState,
        isStartConversationLoading: false
      }
    );
  })
})