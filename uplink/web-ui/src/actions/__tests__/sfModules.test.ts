import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as conversationActions from '../sfModules';
import { SfModulesActionTypes } from "../sfModules";
import root from '../../reducers/root';

describe('Conversation actions', () => {
  let mockStore:any;
  let store: MockStoreEnhanced;
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set start of a conversation to success', () => {
    const expectedAction = {
      type: SfModulesActionTypes.START_CONVERSATION_SUCCESS
    }
    expect(conversationActions.startConversationSuccess()).toEqual(expectedAction)
  });

  it('should create an action to set start of a conversation to error', () => {
    const expectedAction = {
      type: SfModulesActionTypes.START_CONVERSATION_ERROR
    }
    expect(conversationActions.startConversationError()).toEqual(expectedAction)
  });

  it('should create an action to set start of a conversation to loading', () => {
    expect(conversationActions.startConversationLoading().type).toEqual(SfModulesActionTypes.START_CONVERSATION_LOADING)
  });

  it('should create an action to start conversation', () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { createContact: {} } }));
    // @ts-ignore
    return store.dispatch(conversationActions.startConversation()).then(() => {
      const expectedActions = [
        SfModulesActionTypes.START_CONVERSATION_LOADING,
        SfModulesActionTypes.START_CONVERSATION_SUCCESS
      ];
      expect(store.getActions().map(action => action.type)).toEqual(expectedActions);
    });
  });
});