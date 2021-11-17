import * as React from 'react';
import * as enzyme from 'enzyme';

import { ForgotPasswordForm } from '../ForgotPasswordForm';
import { historyMock, locationMock, matchMock } from '../../../../utils/mocks';

describe('ForgotPasswordForm', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <ForgotPasswordForm
        history={historyMock}
        isAuthLoading={false}
        location={locationMock}
        match={matchMock}
        sendResetPasswordEmail={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
