import * as React from 'react';
import * as enzyme from 'enzyme';

import { Header } from '../Header';

describe('Header', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Header>
        test
      </Header>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
}); 