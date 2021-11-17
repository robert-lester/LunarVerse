import * as React from 'react';
import * as enzyme from 'enzyme';

import { Auth } from '../Auth';

describe('Auth', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Auth>
      </Auth>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should render children', () => {
    sessionStorage.uplinkAuthenticated = 'true';
    wrapper.instance().forceUpdate();
    expect(wrapper.find('.sf-auth').length).toEqual(0);
  });
});