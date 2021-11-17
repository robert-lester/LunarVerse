import * as React from 'react';
import * as enzyme from 'enzyme';

import Spinner from '../Spinner';

describe('Spinner', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = enzyme.shallow(
      <Spinner />
    );
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
