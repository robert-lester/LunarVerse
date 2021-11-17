import * as React from 'react';
import * as enzyme from 'enzyme';

import PercentageCircle from '../PercentageCircle/PercentageCircle';

describe('PercentageCircle', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <PercentageCircle />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});