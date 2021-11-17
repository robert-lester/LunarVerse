import * as React from 'react';
import * as enzyme from 'enzyme';

import Timeout from '../Timeout/Timeout';

describe('Timeout', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: Timeout;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Timeout
        onToggle={fn}
        onLogout={fn}
        performActivity={fn}
        refreshToken={fn}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Timeout;
  });

  afterEach(() => {
    fn.mockClear();
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should dispatch logout', () => {
    wrapper.setState({ timer: 1});
    instance.updateTimer();
    expect(fn).toHaveBeenCalled();
  });

  it('should not dispatch logout', () => {
    wrapper.setState({ timer: 2});
    instance.updateTimer();
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it('should handle continue by dispatching toggle, activity, and token refresh', () => {
    instance.handleContinue();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should clear the time interval', () => {
    instance.componentWillUnmount();
    expect(instance.timerInterval).toEqual(0);
  });
});
