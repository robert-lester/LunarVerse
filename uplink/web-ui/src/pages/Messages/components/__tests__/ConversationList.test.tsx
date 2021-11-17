import * as React from 'react';
import * as enzyme from 'enzyme';
import moment from 'moment';

import { ConversationList, mapDispatchToProps } from '../ConversationList';
import { ContactNumberType } from '../../../../reducers';
import { Sort } from '../../../../types';
import { MessagesActionTypes } from '../../../../actions';
import { conversationMock } from '../../../../utils/mocks';

describe('ConversationList', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: ConversationList;
  const fn = jest.fn();
  const getConversationsMock = jest.fn();
  const clearSelectedUserNumbersMock = jest.fn();
  const setSortTypeMock = jest.fn();
  beforeEach(() => {
    const component = (
      <ConversationList
        conversationsData={[]}
        dateRange={{
          initial: moment().startOf('month'),
          final: moment().endOf('month')
        }}
        isConversationsDataLoading={false}
        selectedContactNumberType={ContactNumberType.REAL}
        selectedConversationId={null}
        selectedUserNumbers={[]}
        sort={Sort.ASC}
        clearSelectedUserNumbers={clearSelectedUserNumbersMock}
        getConversations={getConversationsMock}
        setSelectedConversationId={fn}
        setSortType={setSortTypeMock}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as ConversationList;
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should get conversations on mount', () => {
    expect(getConversationsMock).toHaveBeenCalledTimes(1);
  });

  it('should clear selected user numbers on unmount', () => {
    instance.componentWillUnmount();
    expect(clearSelectedUserNumbersMock).toHaveBeenCalledTimes(1);
  });

  it('should get conversations on refresh', () => {
    instance.handleRefresh();
    expect(getConversationsMock).toHaveBeenCalledTimes(2);
  });

  it('should render 1 conversation list items', () => {
    wrapper.setProps({conversationsData: [conversationMock]});
    expect(wrapper.find('ConversationListItem').length).toEqual(1);
  });

  it('should dispatch an action for clearSelectedUserNumbers', () => {
    const action = {
      type: MessagesActionTypes.CLEAR_SELECTED_NUMBERS
    }
    expect(mapDispatchToProps.clearSelectedUserNumbers()).toEqual(action);
  });

  it('should dispatch an action for setSelectedConversationId', () => {
    const action = {
      payload: '1',
      type: MessagesActionTypes.SET_SELECTED_CONVERSATION_ID
    }
    expect(mapDispatchToProps.setSelectedConversationId('1')).toEqual(action);
  });

  it('should dispatch an action for setSortType', () => {
    const action = {
      payload: Sort.ASC,
      type: MessagesActionTypes.SET_SORT_TYPE
    }
    expect(mapDispatchToProps.setSortType(Sort.ASC)).toEqual(action);
  });
});
