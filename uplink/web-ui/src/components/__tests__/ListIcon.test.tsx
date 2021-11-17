import * as React from 'react';
import * as enzyme from 'enzyme';

import { ListIcon } from '../ListIcon/ListIcon';
import { IconNames } from '../Icon/Icon';

describe('ListIcon', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <ListIcon
        iconName={IconNames.ARROW_UPWARD}
        label="Test"
        onClick={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
