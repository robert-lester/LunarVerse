import thunk from 'redux-thunk';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';

import * as conversationsActions from '../conversationsActions';
import root from '../../reducers/root';
import { ConversationActionTypes } from '../conversationActions';
import { ConversationsActionTypes } from '../conversationsActions';
import { MessagesActionTypes } from '../messages';
import { conversationMock } from '../../utils/mocks';

describe('Conversations actions', () => {
  let mockStore: any;
  let store: MockStoreEnhanced;
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set get of conversations data to loading', () => {
    expect(conversationsActions.getConversationsDataLoading().type).toEqual(ConversationsActionTypes.GET_CONVERSATIONS_DATA_LOADING)
  });

  it('should create an action to set get of conversations data to error', () => {
    expect(conversationsActions.getConversationsDataError().type).toEqual(ConversationsActionTypes.GET_CONVERSATIONS_DATA_ERROR)
  });

  it('should create an action to set get of conversations data to success', () => {
    expect(conversationsActions.getConversationsDataSuccess([conversationMock]).type).toEqual(ConversationsActionTypes.GET_CONVERSATIONS_DATA_SUCCESS)
  });

  it('should dispatch actions for get conversations data success', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getConversations: {} } }));
    // @ts-ignore
    return store.dispatch(conversationsActions.getConversationsData([''])).then(() => {
      const expectedActions = [
        ConversationsActionTypes.GET_CONVERSATIONS_DATA_LOADING,
        ConversationActionTypes.CLEAR_CONVERSATION_DATA,
        MessagesActionTypes.SET_SELECTED_CONVERSATION_ID,
        ConversationsActionTypes.GET_CONVERSATIONS_DATA_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });

  it('should dispatch actions for get conversations data error', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { getConversations: {} } }), { status: 400 });
    // @ts-ignore
    return store.dispatch(conversationsActions.getConversationsData([''])).then(() => {
      const expectedActions = [
        ConversationsActionTypes.GET_CONVERSATIONS_DATA_LOADING,
        ConversationActionTypes.CLEAR_CONVERSATION_DATA,
        MessagesActionTypes.SET_SELECTED_CONVERSATION_ID,
        ConversationsActionTypes.GET_CONVERSATIONS_DATA_ERROR
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});