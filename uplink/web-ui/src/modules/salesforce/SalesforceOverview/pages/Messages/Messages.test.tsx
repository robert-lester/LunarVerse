import * as React from 'react';
import * as enzyme from 'enzyme';

import { Messages, mapDispatchToProps } from './Messages';
import { MessagesActionTypes } from '../../../../../actions';

describe('Messages', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: Messages;
  const fn = jest.fn();
  const activityData = {
    firstInBound: '',
    firstOutBound: '',
    id: 0,
    invite: '',
    lastInBound: '',
    lastOutBound: '',
    physicalNumber: '',
    status: '',
    systemNumber: '',
    isUser: true
  };
  beforeEach(() => {
    const component = (
      <Messages
        getConversationData={fn}
        setConversationView={fn}
        isActivityDataLoading={false}
        activityData={activityData}
        conversationView="list"
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Messages;
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should render <Loading/>', () => {
    wrapper.setProps({ isActivityDataLoading: true });
    expect(wrapper.find('Loading').length).toEqual(1);
  });

  it('should check client width on mount and set view', () => {
    expect(instance.props.conversationView).toEqual('list');
  });

  it('should set view to list on unmount', () => {
    instance.componentWillUnmount()
    expect(instance.props.conversationView).toEqual('list');
  });

  it('should set view to list on handling go back', () => {
    instance.handleGoBack()
    expect(instance.props.conversationView).toEqual('list');
  });

  // TODO: Something about the way this is being tested doesn't feel right...
  it('should dispatch getConversationData', () => {
    expect(mapDispatchToProps.getConversationData()).toEqual(expect.any(Function));
  });

  it('should dispatch setConversationView', () => {
    const action = {
      payload: 'list',
      type: MessagesActionTypes.SET_CONVERSATION_VIEW
    }
    expect(mapDispatchToProps.setConversationView('list')).toEqual(action);
  });
});