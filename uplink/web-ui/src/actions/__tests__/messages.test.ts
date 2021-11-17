import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as messagesActions from '../messages';
import { MessagesActionTypes } from "../messages";
import { ContactNumberType } from '../../reducers';
import root from '../../reducers/root';
import { Sort } from '../../types';

describe('Messages actions', () => {
  let mockStore;
  let store: MockStoreEnhanced;
  beforeAll(() => {
    mockStore = configureStore([thunk]);
    store = mockStore(root.getState());
  });

  afterEach(() => {
    store.clearActions();
  });

  it('should create an action to set messages selected number', () => {
    const expectedAction = {
      type: MessagesActionTypes.SET_SELECTED_NUMBER,
      payload: ''
    }
    expect(messagesActions.setMessagesSelectedNumber('')).toEqual(expectedAction)
  });

  it('should create an action to set selected contact number type', () => {
    const expectedAction = {
      type: MessagesActionTypes.SET_SELECTED_CONTACT_NUMBER_TYPE,
      payload: ContactNumberType.REAL
    }
    expect(messagesActions.setSelectedContactNumberType(ContactNumberType.REAL)).toEqual(expectedAction)
  });

  it('should create an action to set date range', () => {
    const payload = {
      initial: null,
      final: null
    }
    const expectedAction = {
      type: MessagesActionTypes.SET_DATE_RANGE,
      payload
    }
    expect(messagesActions.setMessagesDateRange(payload)).toEqual(expectedAction)
  });

  it('should create an action to set selected conversation', () => {
    const expectedAction = {
      type: MessagesActionTypes.SET_SELECTED_CONVERSATION_ID,
      payload: null
    }
    expect(messagesActions.setSelectedConversationId(null)).toEqual(expectedAction)
  });

  it('should create an action to set conversation view', () => {
    const expectedAction = {
      type: MessagesActionTypes.SET_CONVERSATION_VIEW,
      payload: ''
    }
    expect(messagesActions.setConversationView('')).toEqual(expectedAction)
  });

  it('should create an action to set sort type', () => {
    const expectedAction = {
      type: MessagesActionTypes.SET_SORT_TYPE,
      payload: Sort.ASC
    }
    expect(messagesActions.setSortType(Sort.ASC)).toEqual(expectedAction)
  });
});