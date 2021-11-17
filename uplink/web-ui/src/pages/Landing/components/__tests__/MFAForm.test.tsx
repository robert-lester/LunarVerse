import * as React from 'react';
import * as enzyme from 'enzyme';

import { MFAForm } from '../MFAForm';
import { historyMock, locationMock, matchMock } from '../../../../utils/mocks';

describe('MFAForm', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <MFAForm
        history={historyMock}
        isAuthLoading={false}
        location={locationMock}
        match={matchMock}
        authenticateUser={fn}
        resendMFACode={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
