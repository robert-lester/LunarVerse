import * as React from 'react';
import * as enzyme from 'enzyme';
import moment from 'moment';

import { SalesforceConversation, mapDispatchToProps } from './SalesforceConversation';
import { MessagesActionTypes } from '../../../actions';
import { dateRangeMock } from '../../../utils/mocks';

describe('SalesforceConversation', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: SalesforceConversation;
  const fn = jest.fn();
  const conversationId = '6e8218d4-8b15-456a-a83f-0a15745d10aa';
  const timestamp = '2019-05-23T15:03:09-04:00';
  const uplinkDisplayURL = `https://uplink.belunar.com/messages?cid=${conversationId}&mid=97c389d3-1ba5-4dee-863f-eb6317c75080&t=${timestamp}`;
  beforeEach(() => {
    const component = (
      <SalesforceConversation
        setSelectedConversationId={fn}
        setDateRange={fn}
        conversationId={null}
        finalDateRangeDate={null}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as SalesforceConversation;
  });

  afterEach(() => {
    sessionStorage.clear();
    fn.mockReset();
  })

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should set conversation id and date range on mount', () => {
    sessionStorage.uplinkDisplayURL = uplinkDisplayURL;
    instance.componentDidMount();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not set conversation id and date range on mount', () => {
    instance.componentDidMount();
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should return conversation URL parameters', () => {
    const returnValue = {
      conversationId,
      timestamp
    }
    sessionStorage.uplinkDisplayURL = uplinkDisplayURL;
    expect(instance.getConversationURLParameters()).toEqual(returnValue);
  });

  it('should not return conversation URL parameters', () => {
    const returnValue = {
      conversationId: undefined,
      timestamp: undefined
    }
    expect(instance.getConversationURLParameters()).toEqual(returnValue);
  });

  it('should render default messaging', () => {
    expect(wrapper.find('.sf-default-message').length).toEqual(1);
  });

  it('should not render default messaging', () => {
    wrapper.setProps({ conversationId, finalDateRangeDate: moment() });
    expect(wrapper.find('.sf-default-message').length).toEqual(0);
  });

  it(`should dispatch ${MessagesActionTypes.SET_SELECTED_CONVERSATION_ID}`, () => {
    expect(mapDispatchToProps.setSelectedConversationId(conversationId).type).toEqual(MessagesActionTypes.SET_SELECTED_CONVERSATION_ID);
  });

  it(`should dispatch ${MessagesActionTypes.SET_DATE_RANGE}`, () => {
    expect(mapDispatchToProps.setDateRange(dateRangeMock).type).toEqual(MessagesActionTypes.SET_DATE_RANGE);
  });
});