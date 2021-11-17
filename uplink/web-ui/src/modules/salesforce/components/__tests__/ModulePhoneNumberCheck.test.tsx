import * as React from 'react';
import * as enzyme from 'enzyme';

import { ModulePhoneNumberCheck, mapDispatchToProps } from '../ModulePhoneNumberCheck';
import { activityMock } from '../../../../utils/mocks';

describe('ModulePhoneNumberCheck', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <ModulePhoneNumberCheck
        getActivityData={fn}
        activityData={activityMock}
        isActivityDataLoading={false}
      >
        <div className="test" />
      </ModulePhoneNumberCheck>
    );
    wrapper = enzyme.shallow(component);
    sessionStorage.clear();
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should render <Loading/>', () => {
    wrapper.setProps({ isActivityDataLoading: true });
    expect(wrapper.find('Loading').length).toEqual(1);
  });

  it('should render message to update mobile field', () => {
    const systemNumber = '(407) 738-7892';
    sessionStorage.uplinkContactPhoneNumber = systemNumber;
    wrapper.setProps({ activityData: { ...activityMock, systemNumber, isUser: false } });
    expect(wrapper.find('.sf-default-message').length).toEqual(1);
  });

  it('should render children', () => {
    wrapper.setProps({ activityData: null });
    expect(wrapper.find('.test').length).toEqual(1);
  });

  it('should dispatch getActivityData', () => {
    expect(mapDispatchToProps.getActivityData()).toEqual(expect.any(Function));
  });
});