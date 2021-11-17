import * as React from 'react';
import * as enzyme from 'enzyme';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-140154106-1', { testMode: true });

import { Settings } from '../Settings';
import { historyMock, locationMock, matchMock } from '../../../utils/mocks';

describe('Settings', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Settings
        getIntegrationSettings={fn}
        history={historyMock}
        integrationSettings={null}
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