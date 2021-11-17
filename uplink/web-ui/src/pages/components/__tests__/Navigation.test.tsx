import * as React from 'react';
import * as enzyme from 'enzyme';

import { Navigation } from '../Navigation';
import { historyMock, locationMock, matchMock } from '../../../utils/mocks';

describe('Navigation', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Navigation
        history={historyMock}
        location={locationMock}
        match={matchMock}
        signOut={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
}); 