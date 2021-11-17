import * as React from 'react';
import * as enzyme from 'enzyme';

import TextArea from '../TextArea/TextArea';

describe('TextArea', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <TextArea
        onClick={fn}
        label="Label"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});