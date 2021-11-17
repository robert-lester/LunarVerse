import * as React from 'react';
import * as enzyme from 'enzyme';

import IconLogo from '../IconLogo';

describe('IconLogo', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = enzyme.shallow(
      <IconLogo />
    );
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
