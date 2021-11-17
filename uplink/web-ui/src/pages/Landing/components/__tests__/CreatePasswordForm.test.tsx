import * as React from 'react';
import * as enzyme from 'enzyme';

import { CreatePasswordForm } from '../CreatePasswordForm';
import { historyMock, locationMock, matchMock } from '../../../../utils/mocks';

describe('CreatePasswordForm', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <CreatePasswordForm
        history={historyMock}
        isAuthLoading={false}
        isURLTokenLoading={false}
        location={locationMock}
        match={matchMock}
        authenticateUser={fn}
        verifyURLToken={fn}
        urlTokenData={null}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
