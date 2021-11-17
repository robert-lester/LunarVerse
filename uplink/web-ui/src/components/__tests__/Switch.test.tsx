import * as React from 'react';
import * as enzyme from 'enzyme';

import Switch from '../Switch/Switch';

describe('Switch', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Switch
        checked={false}
        onChange={fn}
        label="Test Switch"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should have unchecked css class', () => {
    expect(wrapper.find('.unchecked')).toHaveLength(0);
  });
});
