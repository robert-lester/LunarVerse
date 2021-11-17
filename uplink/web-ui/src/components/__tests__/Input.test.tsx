import * as React from 'react';
import * as enzyme from 'enzyme';

import Input from '../Input/Input';

describe('Input', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Input
        onClick={fn}
        label="Label"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});