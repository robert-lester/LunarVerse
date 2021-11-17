import * as React from 'react';
import * as enzyme from 'enzyme';

import UserInitials from '../UserInitials/UserInitials';

describe('UserInitials', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <UserInitials
        name="Test Name"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});