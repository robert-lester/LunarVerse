import * as React from 'react';
import * as enzyme from 'enzyme';

import { SalesforceOverview, mapDispatchToProps } from './SalesforceOverview';

describe('SalesforceOverview', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: SalesforceOverview;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <SalesforceOverview
        getUserData={fn}
        getActivityData={fn}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as SalesforceOverview;
  });

  afterEach(() => {
    sessionStorage.clear();
    fn.mockReset();
  })

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should not get user data or activity data if mobile number is not present', () => {
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should get user data or activity data if mobile number is present on mount', () => {
    sessionStorage.uplinkContactPhoneNumber = '(407) 738 - 7892';
    instance.componentDidMount();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should get user data or activity data if mobile number is present on mount', () => {
    instance.componentDidMount();
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should toggle tab based on given index', () => {
    instance.toggleTab(1);
    expect(wrapper.state('tab')).toEqual(1);
    expect(fn).toHaveBeenCalled();
  });

  it('should render default messaging', () => {
    expect(wrapper.find('.sf-default-message').length).toEqual(1);
  });

  it('should not render default messaging', () => {
    sessionStorage.uplinkContactPhoneNumber = '(407) 738 - 7892';
    wrapper.instance().forceUpdate();
    expect(wrapper.find('.sf-default-message').length).toEqual(0);
  });

  // TODO: Something about the way this is being tested doesn't feel right...
  it('should dispatch getUserData', () => {
    expect(mapDispatchToProps.getActivityData()).toEqual(expect.any(Function));
  });

  it('should dispatch getActivityData', () => {
    expect(mapDispatchToProps.getUserData()).toEqual(expect.any(Function));
  });
});