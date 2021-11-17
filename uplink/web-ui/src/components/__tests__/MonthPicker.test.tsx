import * as React from 'react';
import * as enzyme from 'enzyme';

import MonthPicker from '../MonthPicker/MonthPicker';

describe('MonthPicker', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <MonthPicker
        onDatesChange={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});