import * as React from 'react';
import * as enzyme from 'enzyme';

import { NavigationPrompt } from '../NavigationPrompt/NavigationPrompt';

describe('NavigationPrompt', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <NavigationPrompt when={true}/>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
