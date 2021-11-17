import * as React from 'react';
import * as enzyme from 'enzyme';

import { SectionTitle } from '../Menu';

describe('SectionTitle', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <SectionTitle title="Test" />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
