import * as React from 'react';
import * as enzyme from 'enzyme';

import Popover from '../Popover/Popover';

describe('Popover', () => {
  let wrapper: enzyme.ShallowWrapper;
  let mounted: enzyme.ReactWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Popover
        clickElement={<div className="popover-test">hello!</div>}
        onToggle={fn}
        isOpen={true}
      />
    );
    wrapper = enzyme.shallow(component);
    mounted = enzyme.mount(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should popover content', () => {
    mounted.find('.popover-test').simulate('click');
    expect(mounted.find('.l-popover__content').length).toEqual(1);
  });
});
