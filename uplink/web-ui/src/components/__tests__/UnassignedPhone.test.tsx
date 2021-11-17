import * as React from 'react';
import * as enzyme from 'enzyme';

import UnassignedPhone from '../UnassignedPhone/UnassignedPhone';

describe('UnassignedPhone', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <UnassignedPhone
        selected={false}
        selectable={false}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
