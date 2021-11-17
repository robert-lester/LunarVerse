import messagesReducer, { messagesReducerInitialState, ContactNumberType } from '../messages';
import { MessagesActionTypes } from '../../actions';
import { Sort } from '../../types';

describe('messages reducer', () => {
  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(messagesReducer(messagesReducerInitialState, {})).toEqual(messagesReducerInitialState)
  })

  it(`should handle ${MessagesActionTypes.SET_SELECTED_NUMBER}`, () => {
    expect(
      messagesReducer(messagesReducerInitialState, {
        type: MessagesActionTypes.SET_SELECTED_NUMBER,
        payload: '0'
      })
    ).toEqual(
      {
        ...messagesReducerInitialState,
        selectedUserNumbers: ['0']
      }
    );
  })

  it(`should handle ${MessagesActionTypes.CLEAR_SELECTED_NUMBERS}`, () => {
    expect(
      messagesReducer(messagesReducerInitialState, {
        type: MessagesActionTypes.CLEAR_SELECTED_NUMBERS,
      })
    ).toEqual(
      {
        ...messagesReducerInitialState,
        selectedUserNumbers: []
      }
    );
  })

  it(`should handle ${MessagesActionTypes.SET_SORT_TYPE}`, () => {
    expect(
      messagesReducer(messagesReducerInitialState, {
        type: MessagesActionTypes.SET_SORT_TYPE,
        payload: Sort.ASC
      })
    ).toEqual(
      {
        ...messagesReducerInitialState,
        sort: Sort.ASC
      }
    );
  })

  it(`should handle ${MessagesActionTypes.SET_DATE_RANGE}`, () => {
    const dateRange = {
      initial: null,
      final: null
    }
    expect(
      messagesReducer(messagesReducerInitialState, {
        type: MessagesActionTypes.SET_DATE_RANGE,
        payload: dateRange
      })
    ).toEqual(
      {
        ...messagesReducerInitialState,
        dateRange
      }
    );
  })

  it(`should handle ${MessagesActionTypes.SET_SELECTED_CONVERSATION_ID}`, () => {
    expect(
      messagesReducer(messagesReducerInitialState, {
        type: MessagesActionTypes.SET_SELECTED_CONVERSATION_ID,
        payload: '0'
      })
    ).toEqual(
      {
        ...messagesReducerInitialState,
        selectedConversationId: '0'
      }
    );
  })

  it(`should handle ${MessagesActionTypes.SET_CONVERSATION_VIEW}`, () => {
    expect(
      messagesReducer(messagesReducerInitialState, {
        type: MessagesActionTypes.SET_CONVERSATION_VIEW,
        payload: ''
      })
    ).toEqual(
      {
        ...messagesReducerInitialState,
        conversationView: ''
      }
    );
  })

  it(`should handle ${MessagesActionTypes.SET_SELECTED_CONTACT_NUMBER_TYPE}`, () => {
    expect(
      messagesReducer(messagesReducerInitialState, {
        type: MessagesActionTypes.SET_SELECTED_CONTACT_NUMBER_TYPE,
        payload: ContactNumberType.REAL
      })
    ).toEqual(
      {
        ...messagesReducerInitialState,
        selectedContactNumberType: ContactNumberType.REAL
      }
    );
  })
})