import * as React from 'react';
import * as enzyme from 'enzyme';

import { Section } from '../Menu';

describe('Section', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Section>
        <div>Test</div>
      </Section>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
