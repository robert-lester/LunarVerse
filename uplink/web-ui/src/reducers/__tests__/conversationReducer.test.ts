import messagesReducer, { conversationReducerInitialState } from '../conversationReducer';
import { ConversationActionTypes } from '../../actions';
import { UserNumberType, UserMessageType } from '../../apollo/types';

describe('conversation reducer', () => {
  const conversation = {
    id: 0,
    phoneNumbers: [{
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
    }],
    messages: [
      {
        phoneNumber: {
          systemNumber: ''
        },
        duration: 0,
        media: [
          {
            mime_type: 'img/jpg',
            url: 'https://api.twilio.com/2010-04-01/Accounts/ACe0cb42e1ed00756c6e9f93a607d4ee6a/Messages/MM8cb47cf3fd15e81b093e02191464c173/Media/MEf4af29530a111ab39cd103c5a64c9403'
          },
          {
            mime_type: 'img/jpg',
            url: 'https://api.twilio.com/2010-04-01/Accounts/ACe0cb42e1ed00756c6e9f93a607d4ee6a/Messages/MM8cb47cf3fd15e81b093e02191464c173/Media/MEf4af29530a111ab39cd103c5a64c9403'
          },
          {
            mime_type: 'img/jpg',
            url: 'https://api.twilio.com/2010-04-01/Accounts/ACe0cb42e1ed00756c6e9f93a607d4ee6a/Messages/MM8cb47cf3fd15e81b093e02191464c173/Media/MEf4af29530a111ab39cd103c5a64c9403'
          },
          {
            mime_type: 'img/jpg',
            url: 'https://api.twilio.com/2010-04-01/Accounts/ACe0cb42e1ed00756c6e9f93a607d4ee6a/Messages/MM8cb47cf3fd15e81b093e02191464c173/Media/MEf4af29530a111ab39cd103c5a64c9403'
          }
        ],
        created_at: 'Wed, 19 Dec 2018 16:30:02 GMT',
        sender: {
          color: 'red',
          id: 1,
          name: 'Juan Bernal',
          phoneNumber: {
            forward: null,
            id: 3,
            messages: [],
            systemNumber: '(586) 474-4468',
            type: UserNumberType.USER,
            user: '',
            callOrText30Days: false
          },
          type: UserMessageType.USER
        },
        message: 'Hi!',
        public_id: 'b2b6d4fb-205b-45e1-b37a-8da18ebd2085',
        type: UserMessageType.USER
      }
    ],
    updated_at: ''
  };

  it('should return the initial state', () => {
    // @ts-ignore react-redux type is faulty
    expect(messagesReducer(conversationReducerInitialState, {})).toEqual(conversationReducerInitialState)
  })

  it(`should handle ${ConversationActionTypes.GET_CONVERSATION_DATA_LOADING}`, () => {
    expect(
      messagesReducer(conversationReducerInitialState, {
        type: ConversationActionTypes.GET_CONVERSATION_DATA_LOADING,
      })
    ).toEqual(
      {
        ...conversationReducerInitialState,
        payload: null,
        isLoading: true
      }
    );
  })

  it(`should handle ${ConversationActionTypes.GET_CONVERSATION_DATA_SUCCESS}`, () => {
    expect(
      messagesReducer(conversationReducerInitialState, {
        type: ConversationActionTypes.GET_CONVERSATION_DATA_SUCCESS,
        payload: conversation
      })
    ).toEqual(
      {
        ...conversationReducerInitialState,
        payload: conversation,
        isLoading: false
      }
    );
  })

  it(`should handle ${ConversationActionTypes.GET_CONVERSATION_DATA_ERROR}`, () => {
    expect(
      messagesReducer(conversationReducerInitialState, {
        type: ConversationActionTypes.GET_CONVERSATION_DATA_ERROR
      })
    ).toEqual(
      {
        ...conversationReducerInitialState,
        isLoading: false
      }
    );
  })

  it(`should handle ${ConversationActionTypes.CLEAR_CONVERSATION_DATA}`, () => {
    expect(
      messagesReducer(conversationReducerInitialState, {
        type: ConversationActionTypes.CLEAR_CONVERSATION_DATA
      })
    ).toEqual(
      {
        ...conversationReducerInitialState,
        payload: null
      }
    );
  })
})