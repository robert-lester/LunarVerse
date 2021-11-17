import * as React from 'react';
import * as enzyme from 'enzyme';

import { Icon, IconNames } from '../Icon/Icon';

describe('Icon', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Icon
        icon={IconNames.SEARCH}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});