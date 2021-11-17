import * as React from 'react';
import * as enzyme from 'enzyme';

import { Layout } from '../Layout';

describe('Layout', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Layout>
        test
      </Layout>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
}); 