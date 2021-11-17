import * as React from 'react';
import * as enzyme from 'enzyme';

import { ConversationList, mapDispatchToProps } from '../ConversationList';
import { ContactNumberType } from '../../../../../../../reducers';
import { Sort } from '../../../../../../../types';
import { userMock, dateRangeMock, conversationMock } from '../../../../../../../utils/mocks';
import { MessagesActionTypes } from '../../../../../../../actions';

describe('ConversationList', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <ConversationList
        getConversations={fn}
        setDateRange={fn}
        setSelectedConversationId={fn}
        setConversationView={fn}
        startConversation={fn}
        setSortType={fn}
        isConversationsDataLoading={false}
        selectedConversationId={null}
        selectedContactNumberType={ContactNumberType.REAL}
        sort={Sort.ASC}
        isStartConversationLoading={false}
        userData={userMock}
        dateRange={dateRangeMock}
        conversationsData={[conversationMock]}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should dispatch getConversations', () => {
    expect(mapDispatchToProps.getConversations(['(407) 738-7892'])).toEqual(expect.any(Function));
  });

  it('should dispatch setDateRange', () => {
    const action = {
      payload: dateRangeMock,
      type: MessagesActionTypes.SET_DATE_RANGE
    }
    expect(mapDispatchToProps.setDateRange(dateRangeMock)).toEqual(action);
  });

  it('should dispatch setSelectedConversationId', () => {
    const action = {
      payload: 1,
      type: MessagesActionTypes.SET_SELECTED_CONVERSATION_ID
    }
    expect(mapDispatchToProps.setSelectedConversationId(1)).toEqual(action);
  });

  it('should dispatch setSortType', () => {
    const action = {
      payload: Sort.ASC,
      type: MessagesActionTypes.SET_SORT_TYPE
    }
    expect(mapDispatchToProps.setSortType(Sort.ASC)).toEqual(action);
  });

  it('should dispatch startConversation', () => {
    expect(mapDispatchToProps.startConversation()).toEqual(expect.any(Function));
  });

  it('should dispatch setConversationView', () => {
    const action = {
      payload: 'list',
      type: MessagesActionTypes.SET_CONVERSATION_VIEW
    }
    expect(mapDispatchToProps.setConversationView('list')).toEqual(action);
  });
});