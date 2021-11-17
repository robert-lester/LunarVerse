import * as React from 'react';
import * as enzyme from 'enzyme';

import PhoneType from '../PhoneType/PhoneType';

describe('PhoneType', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <PhoneType/>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
