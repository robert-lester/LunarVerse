import * as React from 'react';
import * as enzyme from 'enzyme';

import IconButton from '../IconButton/IconButton';
import { Icon, IconNames } from '../Icon/Icon';

describe('IconButton', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <IconButton
        Icon={<Icon icon={IconNames.SEARCH}/>}
        label="Label"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
