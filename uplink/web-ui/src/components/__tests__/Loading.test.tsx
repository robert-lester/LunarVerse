import * as React from 'react';
import * as enzyme from 'enzyme';

import { Loading } from '../Loading/Loading';

describe('Loading', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Loading />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
