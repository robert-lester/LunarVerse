import * as React from 'react';
import * as enzyme from 'enzyme';

import Checkbox from '../Checkbox/Checkbox';

describe('Checkbox', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Checkbox
        isChecked={false}
        label="Label"
        onToggle={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});