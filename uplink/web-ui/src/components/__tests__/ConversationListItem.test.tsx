import * as React from 'react';
import * as enzyme from 'enzyme';

import ConversationListItem from '../ConversationListItem/ConversationListItem';
import { ContactNumberType } from '../../reducers';
import { userNumberMock } from '../../utils/mocks';
import { UserNumberType } from '../../apollo/types';

describe('ConversationListItem', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: ConversationListItem;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <ConversationListItem
        isSelected={false}
        updatedAt="2019-07-07"
        onClick={fn}
        contactDisplay={ContactNumberType.REAL}
        isContactVisible={true}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as ConversationListItem;
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should render nothing for user number icon', () => {
    expect(instance.renderUserNumberIcon()).toEqual(undefined);
  });

  it('should render PhoneType for user number icon', () => {
    wrapper.setProps({ userNumber: userNumberMock });
    expect(instance.renderUserNumberIcon()!.type.name).toEqual('PhoneType');
  });

  it('should render UserInitials for user number icon', () => {
    wrapper.setProps({ userNumber: { ...userNumberMock, type: UserNumberType.USER } });
    expect(instance.renderUserNumberIcon()!.type.name).toEqual('UserInitials');
  });
});