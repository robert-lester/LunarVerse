import * as React from 'react';
import * as enzyme from 'enzyme';

import Dropdown from '../Dropdown/Dropdown';

describe('Dropdown', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: Dropdown;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Dropdown
        onChange={fn}
        items={[]}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Dropdown;
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should return default placeholder', () => {
    expect(instance.getSelectedItem()).toEqual('Select an item ...');
  });

  it('should return props placeholder', () => {
    wrapper.setProps({ placeholder: 'Test' });
    expect(instance.getSelectedItem()).toEqual('Test');
  });
});