import * as React from 'react';
import * as enzyme from 'enzyme';

import { Label } from '../Label/Label';

describe('Label', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Label
        label="Label"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
