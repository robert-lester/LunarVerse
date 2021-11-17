import * as React from 'react';
import * as enzyme from 'enzyme';

import { Menu } from '../Menu/Menu';
import { IconNames } from '../Icon/Icon';

describe('Menu', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Menu
        icon={IconNames.INFO}
        title="Test"
      >
        <div>Test</div>
      </Menu>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
