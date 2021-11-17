import * as React from 'react';
import * as enzyme from 'enzyme';

import Logo from '../Logo';

describe('Logo', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = enzyme.shallow(
      <Logo />
    );
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
