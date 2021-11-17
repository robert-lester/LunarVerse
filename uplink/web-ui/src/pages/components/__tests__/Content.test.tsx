import * as React from 'react';
import * as enzyme from 'enzyme';

import { Content } from '../Content';

describe('Content', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Content>
        test
      </Content>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
}); 