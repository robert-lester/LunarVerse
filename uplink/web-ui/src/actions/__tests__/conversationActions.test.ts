import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';
import moment from 'moment';

import * as conversationActions from '../conversationActions';
import { ConversationActionTypes } from '../conversationActions';
import root from '../../reducers/root';
import { conversationMock, messageMock } from '../../utils/mocks';

describe('Conversation actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set conversation data', () => {
    const expectedAction = {
      type: ConversationActionTypes.GET_CONVERSATION_DATA_SUCCESS,
      payload: conversationMock
    }
    expect(conversationActions.getConversationDataSuccess(conversationMock)).toEqual(expectedAction)
  });

  it('should create an action to set get of conversation data to loading', () => {
    expect(conversationActions.getConversationDataLoading().type).toEqual(ConversationActionTypes.GET_CONVERSATION_DATA_LOADING)
  });

  it('should create an action to set get of conversation data to error', () => {
    expect(conversationActions.getConversationDataError().type).toEqual(ConversationActionTypes.GET_CONVERSATION_DATA_ERROR)
  });

  it('should dispatch actions for get conversation data success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { tokenDetail: {} } }));
    // @ts-ignore
    return store.dispatch(conversationActions.getConversationData()).then(() => {
      const expectedActions = [
        ConversationActionTypes.GET_CONVERSATION_DATA_LOADING,
        ConversationActionTypes.GET_CONVERSATION_DATA_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for get conversation data error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { tokenDetail: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(conversationActions.getConversationData()).then(() => {
      const expectedActions = [
        ConversationActionTypes.GET_CONVERSATION_DATA_LOADING,
        ConversationActionTypes.GET_CONVERSATION_DATA_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should return the same date given', () => {
    expect(conversationActions.getFinalDate(null, null, null, 0)).toEqual(null)
  });

  it('should return the date of now', () => {
    const now = moment();
    expect(conversationActions.getFinalDate(null, null, now, 0)).toEqual(moment(now).format('YYYY-MM-DDTHH:mm:ss.sssZ'))
  });

  it('should return the date of the first conversation message', () => {
    const now = moment();
    expect(conversationActions.getFinalDate(conversationMock, '6e8218d4-8b15-456a-a83f-0a15745d10aa', now, -35)).toEqual(moment(messageMock.created_at).format('YYYY-MM-DDTHH:mm:ss.sssZ'))
  });

  it('should return the date of the last conversation message', () => {
    const now = moment();
    expect(conversationActions.getFinalDate(conversationMock, '6e8218d4-8b15-456a-a83f-0a15745d10aa', now, 35)).toEqual(moment(messageMock.created_at).format('YYYY-MM-DDTHH:mm:ss.sssZ'))
  });

  it('should return a unique array without any indeces', () => {
    expect(conversationActions.deduplicateConversationMessages([messageMock], [messageMock])).toEqual([])
  });

  it('should return a conversation without new messages', () => {
    expect(conversationActions.parseConversationData([messageMock], conversationMock, -35)).toEqual(conversationMock)
  });

  it('should return a conversation with new messages', () => {
    const newMessage = { ...messageMock, public_id: '2' };
    expect(conversationActions.parseConversationData([messageMock, newMessage], conversationMock, 35)).toEqual({ ...conversationMock, messages: [...conversationMock.messages, newMessage] })
  });
});