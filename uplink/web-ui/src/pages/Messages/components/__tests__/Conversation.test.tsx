import * as React from 'react';
import * as enzyme from 'enzyme';

import { Conversation, mapDispatchToProps } from '../Conversation';
import { ContactNumberType } from '../../../../reducers';
import { conversationMock } from '../../../../utils/mocks';
import { MessagesActionTypes, ConversationActionTypes } from '../../../../actions';

describe('Conversation', () => {
  let wrapper: enzyme.ShallowWrapper;
  let mounted: enzyme.ReactWrapper;
  let instance: Conversation;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Conversation
        conversation={conversationMock}
        isConversationLoading={false}
        selectedContactNumberType={ContactNumberType.REAL}
        getConversationData={fn}
        setSelectedConversationId={fn}
        selectedConversationId="1"
        clearConversationData={fn}
      />
    );
    wrapper = enzyme.shallow(component);
    mounted = enzyme.mount(component);
    instance = wrapper.instance() as Conversation;
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should increase the media count and update state to scroll conversation to the bottom', () => {
    instance.mediaCount = 1;
    instance.handleMediaLoadComplete();
    expect(instance.mediaCompleteCount).toEqual(1);
    expect(wrapper.state('isMediaLoadComplete')).toEqual(true);
  });

  it('should handle fetch by getting data and disallowing auto scroll', () => {
    instance.handleFetch(1);
    expect(fn).toHaveBeenCalled();
    expect(instance.canConversationScrollToBottom).toEqual(false);
  });

  it('should set scroll, media count, and state when resetting media tracking', () => {
    instance.resetMediaTracking();
    expect(instance.canConversationScrollToBottom).toEqual(true);
    expect(instance.mediaCount).toEqual(0);
    expect(instance.mediaCompleteCount).toEqual(0);
    expect(wrapper.state('isMediaLoadComplete')).toEqual(false);
  });

  it('should scroll conversation to bottom on load media complete', () => {
    const domNode = mounted.find('#uplink-conversations').getDOMNode();
    expect(domNode.scrollTop).toEqual(domNode.scrollHeight);
  });

  it('should render selection message', () => {
    wrapper.setProps({ conversation: null });
    expect(wrapper.find('.messages-conversation__select-conversation').length).toEqual(1);
  });

  it('should dispatch an action for clearConversationData', () => {
    const action = {
      type: ConversationActionTypes.CLEAR_CONVERSATION_DATA
    }
    expect(mapDispatchToProps.clearConversationData()).toEqual(action);
  });

  it('should dispatch an action for setSelectedConversationId', () => {
    const action = {
      payload: '1',
      type: MessagesActionTypes.SET_SELECTED_CONVERSATION_ID
    }
    expect(mapDispatchToProps.setSelectedConversationId('1')).toEqual(action);
  });
});
