import * as React from 'react';
import * as enzyme from 'enzyme';
import moment from 'moment';

import { Aside, mapDispatchToProps } from '../Aside';
import { ContactNumberType } from '../../../../reducers';
import { dateRangeMock, userNumberMock } from '../../../../utils/mocks';
import { MessagesActionTypes } from '../../../../actions';

describe('Aside', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: Aside;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Aside
        dateRange={{
          initial: moment().startOf('month'),
          final: moment().endOf('month')
        }}
        selectedNumbers={[]}
        selectedContactNumberType={ContactNumberType.REAL}
        userNumbers={[userNumberMock]}
        isUserNumbersDataLoading={false}
        setDateRange={fn}
        setSelectedNumber={fn}
        setSelectedContactNumberType={fn}
        getAllUserNumbersData={fn}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Aside;
  });

  afterEach(() => {
    fn.mockClear();
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should invoke getAllUserNumbersData', () => {
    expect(fn).toHaveBeenCalled();
  });

  it('should invoke setDateRange', () => {
    instance.handleDateChange({ startDate: null, endDate: null });
    expect(fn).toHaveBeenCalled();
  });

  it('should invoke setSelectedNumber', () => {
    instance.handleNumberSelection('test');
    expect(fn).toHaveBeenCalled();
  });

  it('should invoke setSelectedContactNumberType', () => {
    const event = { target: { value: 'test' } } as React.ChangeEvent<HTMLInputElement>;
    instance.handleContactNumberTypeClick(event);
    expect(fn).toHaveBeenCalled();
  });

  it('should set state based on search value', () => {
    const event = { target: { value: 'test' } } as React.ChangeEvent<HTMLInputElement>;
    instance.handleSearchChange(event);
    expect(wrapper.state('search')).toEqual('test');
  });

  it('should invoke handleNumberSelection', () => {
    wrapper.find('.messages-aside__user-number').simulate('click');
    expect(fn).toHaveBeenCalled();
  });

  it('should return true for a date outside of range', () => {
    expect(instance.isDateOutsideRange(moment().add(2, 'd'))).toEqual(true);
  });

  it('should return false for a date inside of range', () => {
    expect(instance.isDateOutsideRange(moment())).toEqual(false);
  });

  it('should dispatch an action for setDateRange', () => {
    const action = {
      payload: dateRangeMock,
      type: MessagesActionTypes.SET_DATE_RANGE
    }
    expect(mapDispatchToProps.setDateRange(dateRangeMock)).toEqual(action);
  });

  it('should dispatch an action for setSelectedNumber', () => {
    const action = {
      payload: '',
      type: MessagesActionTypes.SET_SELECTED_NUMBER
    }
    expect(mapDispatchToProps.setSelectedNumber('')).toEqual(action);
  });

  it('should dispatch an action for setSelectedNumber', () => {
    const action = {
      payload: ContactNumberType.REAL,
      type: MessagesActionTypes.SET_SELECTED_CONTACT_NUMBER_TYPE
    }
    expect(mapDispatchToProps.setSelectedContactNumberType(ContactNumberType.REAL)).toEqual(action);
  });
});
