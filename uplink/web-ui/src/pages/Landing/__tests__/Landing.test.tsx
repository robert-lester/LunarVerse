import * as React from 'react';
import * as enzyme from 'enzyme';

import { Landing } from '../Landing';
import { historyMock, locationMock, matchMock } from '../../../utils/mocks';

describe('Landing', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Landing
        history={historyMock}
        isLoading={false}
        location={locationMock}
        match={matchMock}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});