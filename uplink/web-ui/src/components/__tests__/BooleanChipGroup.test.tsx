import * as React from 'react';
import * as enzyme from 'enzyme';

import BooleanChipGroup from '../BooleanChipGroup/BooleanChipGroup';

describe('BooleanChipGroup', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <BooleanChipGroup>
      </BooleanChipGroup>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});