import * as React from 'react';
import * as enzyme from 'enzyme';

import { Sidebar } from '../Sidebar';

describe('Sidebar', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = enzyme.shallow(
      <Sidebar>
        Test
      </Sidebar>
    );
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
