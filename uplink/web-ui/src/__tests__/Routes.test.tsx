import * as React from 'react';
import * as enzyme from 'enzyme';

import { Routes } from '../Routes';

describe('Routes', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Routes/>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
