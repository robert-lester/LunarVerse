import * as React from 'react';
import * as enzyme from 'enzyme';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-140154106-1', { testMode: true });

import App from '../App';

describe('App', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <App/>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
