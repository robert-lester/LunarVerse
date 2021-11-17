import * as React from 'react';
import * as enzyme from 'enzyme';

import { LoginForm } from '../LoginForm';
import { historyMock, matchMock, locationMock } from '../../../../utils/mocks';

describe('LoginForm', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <LoginForm
        history={historyMock}
        isAuthLoading={false}
        location={locationMock}
        match={matchMock}
        authenticateUser={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
