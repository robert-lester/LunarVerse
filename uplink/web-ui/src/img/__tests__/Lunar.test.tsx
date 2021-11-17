import * as React from 'react';
import * as enzyme from 'enzyme';

import Lunar from '../Lunar';

describe('Lunar', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = enzyme.shallow(
      <Lunar />
    );
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
