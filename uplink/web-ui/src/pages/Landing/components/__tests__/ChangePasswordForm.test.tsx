import * as React from 'react';
import * as enzyme from 'enzyme';

import { ChangePasswordForm } from '../ChangePasswordForm';
import { historyMock, locationMock, matchMock } from '../../../../utils/mocks';

describe('ChangePasswordForm', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <ChangePasswordForm
        history={historyMock}
        isAuthLoading={false}
        location={locationMock}
        match={matchMock}
        resetPassword={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
