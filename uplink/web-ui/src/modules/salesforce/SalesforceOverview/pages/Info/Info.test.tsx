import * as React from 'react';
import * as enzyme from 'enzyme';

import { Info, mapDispatchToProps } from './Info';
import { activityMock } from '../../../../../utils/mocks';

describe('Info', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: Info;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Info
        activityData={activityMock}
        userData={null}
        systemNumber="407-738-7892"
        isActivityDataLoading={false}
        isUserDataLoading={false}
        isStartConversationLoading={false}
        getUserData={fn}
        startConversation={fn}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Info;
    sessionStorage.clear();
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should get user data on mount', () => {
    expect(fn).toHaveBeenCalled();
  });

  it('should return a positive match on a contact number', () => {
    sessionStorage.uplinkContactPhoneNumber = ''
    expect(instance.compareContactNumbers()).toEqual(true);
  });

  it('should return a negative match on a contact number', () => {
    sessionStorage.uplinkContactPhoneNumber = '1'
    expect(instance.compareContactNumbers()).toEqual(false);
  });

  it('should render loader', () => {
    wrapper.setProps({ isUserDataLoading: true });
    expect(wrapper.find('.sf-info__loading').length).toEqual(1);
  });

  // TODO: Something about the way this is being tested doesn't feel right...
  it('should dispatch getUserData', () => {
    expect(mapDispatchToProps.getUserData()).toEqual(expect.any(Function));
  });

  it('should dispatch startConversation', () => {
    expect(mapDispatchToProps.startConversation()).toEqual(expect.any(Function));
  });
});