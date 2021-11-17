import * as React from 'react';
import * as enzyme from 'enzyme';

import Chip from '../Chip/Chip';

describe('Chip', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Chip
        onDelete={fn}
        label="Label"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
