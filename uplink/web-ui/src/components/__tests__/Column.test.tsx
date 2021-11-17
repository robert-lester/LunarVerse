import * as React from 'react';
import * as enzyme from 'enzyme';

import { Column } from '../Column/Column';

describe('Column', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Column>
        Test
      </Column>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
