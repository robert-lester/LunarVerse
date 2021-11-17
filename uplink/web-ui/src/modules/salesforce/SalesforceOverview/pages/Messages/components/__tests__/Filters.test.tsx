import * as React from 'react';
import * as enzyme from 'enzyme';
import moment from 'moment';

import Filters from '../Filters';
import { Sort } from '../../../../../../../types';
import { dateRangeMock } from '../../../../../../../utils/mocks';

describe('Filters', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: Filters;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Filters
        sort={Sort.ASC}
        dateRange={dateRangeMock}
        onClose={fn}
        onSubmit={fn}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Filters;
  });

  afterEach(() => {
    fn.mockClear();
  })

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should set date on date change', () => {
    const newDateRange = { startDate: moment(), endDate: moment().add(1, 'd') };
    instance.handleDateChange(newDateRange);
    expect(wrapper.state('newDateRange')).toEqual({ final: newDateRange.endDate, initial: newDateRange.startDate });
  });

  it('should set sort type after chip toggle', () => {
    instance.toggleBooleanChip(Sort.DESC);
    expect(wrapper.state('sortType')).toEqual(Sort.DESC);
  });

  it('should return date check as outside range', () => {
    expect(instance.isDateOutsideRange(moment().add(1, 'd'))).toEqual(true);
  });

  it('should submit on click of submit button', () => {
    wrapper.find('.__footer Button').simulate('click');
    expect(fn).toHaveBeenCalled();
  });
});