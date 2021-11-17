import * as React from 'react';
import * as enzyme from 'enzyme';

import LazyLoader from '../LazyLoader';
import { LAZY_LOAD_OFFSET } from '../../../../actions';

describe('LazyLoader', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: LazyLoader;
  const fn = jest.fn();
  const props = {
    dataSize: 10,
    isDataLoading: false,
    onFetch: fn,
    requestId: 1,
    requestedSize: LAZY_LOAD_OFFSET
  }
  beforeEach(() => {
    const component = (
      <LazyLoader
        {...props}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as LazyLoader;
    fn.mockClear();
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should handle fetch backward', () => {
    instance.handleFetchBackward();
    expect(wrapper.state('isFetchBackwardLoading')).toEqual(true);
    expect(fn).toHaveBeenCalled();
  })

  it('should handle fetch forward', () => {
    instance.handleFetchForward();
    expect(wrapper.state('isFetchForwardLoading')).toEqual(true);
    expect(fn).toHaveBeenCalled();
  })

  it('should not handle fetch backward if data is loading', () => {
    wrapper.setProps({ isDataLoading: true });
    instance.handleFetchBackward();
    expect(fn).toHaveBeenCalledTimes(0);
  })

  it('should not handle fetch forward if data is loading', () => {
    wrapper.setProps({ isDataLoading: true });
    instance.handleFetchForward();
    expect(fn).toHaveBeenCalledTimes(0);
  })

  it('should set fetch backward state to false due to new request', () => {
    wrapper.setState({ isFetchBackwardExhausted: true });
    instance.componentDidUpdate({ ...props, requestId: 2 });
    expect(instance.state.isFetchBackwardExhausted).toEqual(false);
  })

  it('should set fetching states to default', () => {
    instance.componentDidUpdate({ ...props, isDataLoading: true });
    expect(instance.state.isFetchBackwardLoading).toEqual(false);
    expect(instance.state.isFetchForwardLoading).toEqual(false);
    expect(instance.state.isFetchBackwardExhausted).toEqual(false);
  })

  it('should set fetching states to default, but fetch backward exhaustion to true', () => {
    wrapper.setState({ isFetchBackwardLoading: true });
    instance.componentDidUpdate({ ...props, isDataLoading: true });
    expect(instance.state.isFetchBackwardLoading).toEqual(false);
    expect(instance.state.isFetchForwardLoading).toEqual(false);
    expect(instance.state.isFetchBackwardExhausted).toEqual(true);
  })
});
