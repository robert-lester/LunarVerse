import * as React from 'react';
import * as enzyme from 'enzyme';

import { Message } from '../Message';
import { ContactNumberType } from '../../../../reducers';
import { UserMessageType, UserNumberType } from '../../../../apollo/types';
import { senderMock } from '../../../../utils/mocks';
import { PhoneTypeSize, PhoneType, UserInitials, UserInitialsSize } from '../../../../components';

describe('Message', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: Message;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Message
        id="1"
        createdAt=""
        media={[]}
        message=""
        duration={0}
        phoneNumbers={[]}
        selectedContactNumberType={ContactNumberType.REAL}
        sender={{
          color: 'blue',
          id: 1,
          name: 'Test',
          type: 'Test'
        }}
        type={UserMessageType.USER}
        senderPhone={{
          systemNumber: '1234567788'
        }}
        onMediaLoadComplete={fn}
        mediaCompleteCount={0}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Message;
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should invoke media load complete once media is loaded', () => {
    instance.handleMediaLoad()
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should render PhoneType if user number is recycled', () => {
    expect(instance.renderIcon(senderMock, false, ContactNumberType.REAL, 'Recycled'))
      .toEqual(<PhoneType className="" selectable={false} selected={false} size={PhoneTypeSize.REGULAR} status={UserNumberType.RECYCLED} />);
  });

  it('should render UserInitials if sender exists and sender name exists', () => {
    expect(instance.renderIcon(senderMock, false, ContactNumberType.REAL, ''))
      .toEqual(<UserInitials className="" isAssigned={true} name="Juan Bernal" selectable={false} selected={false} size={UserInitialsSize.REGULAR} userColor="red" />);
  });

  it('should render PhoneType if contact number type is real number', () => {
    expect(instance.renderIcon({...senderMock, name: '' }, false, ContactNumberType.REAL, ''))
      .toEqual(<PhoneType className="" selectable={false} selected={false} size={PhoneTypeSize.REGULAR} status={UserNumberType.CONTACT} />);
  });

  it('should render no icon', () => {
    expect(instance.renderIcon(null, false, ContactNumberType.REAL, '')).toEqual(undefined);
  });

  it('should render phone call as message', () => {
    const spy = jest.spyOn(instance, 'renderPhoneCall');
    instance.renderMessage([], '', true, 0, UserMessageType.CALL);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should render regular text message', () => {
    instance.renderMessage([], '', true, 0, UserMessageType.USER)
    expect(wrapper.find('.__phone-call').length).toEqual(0);
    expect(wrapper.find('.__media-text').length).toEqual(0);
  });

  it('should render system message', () => {
    wrapper.setProps({type: UserMessageType.SYSTEM});
    expect(wrapper.find('.messages-message__reassign-user-text').length).toEqual(1);
  });
});
