import * as React from 'react';
import * as enzyme from 'enzyme';

import { Tabs } from '../Tabs/Tabs';

describe('Tabs', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Tabs
        onClick={fn}
        options={[]}
        selected={1}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
