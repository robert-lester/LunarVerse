import * as React from 'react';
import * as enzyme from 'enzyme';

import Button from '../Button/Button';

describe('Button', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Button
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
