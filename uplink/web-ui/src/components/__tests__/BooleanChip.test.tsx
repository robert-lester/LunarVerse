import * as React from 'react';
import * as enzyme from 'enzyme';

import BooleanChip from '../BooleanChip/BooleanChip';

describe('BooleanChip', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <BooleanChip
        value="test"
        onClick={fn}
        label="Test Label"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should callback on click', () => {
    wrapper.simulate('click');
    expect(fn).toBeCalled();
  });

  it('should have inactive class', () => {
    expect(wrapper.hasClass('--inactive')).toEqual(true);
  });

  it('should have active class', () => {
    wrapper.setProps({ isActive: true });
    expect(wrapper.hasClass('--active')).toEqual(true);
  });
});