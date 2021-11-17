import * as React from 'react';
import * as enzyme from 'enzyme';

import FilterGroup from '../FilterGroup/FilterGroup';

describe('FilterGroup', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <FilterGroup>
      </FilterGroup>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
