import * as React from 'react';
import * as enzyme from 'enzyme';
import moment from 'moment';

import DatePicker from '../DatePicker/DatePicker';

describe('DatePicker', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <DatePicker
        startDate={moment()}
        endDate={moment()}
        onDatesChange={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});