import * as React from 'react';
import * as enzyme from 'enzyme';

import Search from '../Search/Search';

describe('Search', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Search
        search=""
        onChange={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
