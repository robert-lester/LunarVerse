import * as React from 'react';
import * as enzyme from 'enzyme';

import SubNavigationLink from '../SubNavigationLink/SubNavigationLink';

describe('SubNavigationLink', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <SubNavigationLink
        to="/test"
        label="Label"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
