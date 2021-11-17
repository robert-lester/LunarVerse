import * as React from 'react';
import * as enzyme from 'enzyme';

import { RegisterPhoneNumberForm } from '../RegisterPhoneNumberForm';
import { historyMock, locationMock, matchMock } from '../../../../utils/mocks';

describe('RegisterPhoneNumberForm', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <RegisterPhoneNumberForm
        history={historyMock}
        isAuthLoading={false}
        location={locationMock}
        match={matchMock}
        registerPhoneNumber={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
