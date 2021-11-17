import * as React from 'react';
import * as enzyme from 'enzyme';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-140154106-1', { testMode: true });

import Messages from '../Messages';

describe('Messages', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Messages />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
