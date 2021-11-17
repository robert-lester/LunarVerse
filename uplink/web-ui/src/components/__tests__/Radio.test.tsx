import * as React from 'react';
import * as enzyme from 'enzyme';

import Radio from '../Radio/Radio';

describe('Radio', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Radio
        checked={false}
        label="Label"
        onClick={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});