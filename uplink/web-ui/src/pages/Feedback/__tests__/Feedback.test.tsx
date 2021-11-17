import * as React from 'react';
import * as enzyme from 'enzyme';

import Feedback from '../Feedback';

describe('Feedback', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    window.open = fn;
    const component = (
      <Feedback onClose={fn}/>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});