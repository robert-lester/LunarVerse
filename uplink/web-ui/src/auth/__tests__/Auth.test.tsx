import * as React from 'react';
import * as enzyme from 'enzyme';

import { Auth } from '../Auth';
import Landing from '../../pages/Landing/Landing';
import { historyMock, locationMock, matchMock } from '../../utils/mocks';

describe('Conversation', () => {
  let wrapper: enzyme.ShallowWrapper;
  let component: React.ReactElement<{}>;
  let instance: Auth;
  let fn = jest.fn();
  beforeEach(() => {
    component = (
      <Auth
        login={Landing}
        isAuthenticated={false}
        authToken=""
        signOut={fn}
        refreshAuthToken={fn}
        authenticateUserSuccess={fn}
        history={historyMock}
        location={locationMock}
        match={matchMock}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as Auth;
    fn.mockClear();
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should update user activity time', () => {
    const previousUserActivityTime = instance.userActivityTime;
    wrapper.setProps({ isAuthenticated: true });
    document.dispatchEvent(new Event('mousemove'));
    expect(instance.userActivityTime).toBeGreaterThan(previousUserActivityTime);
  });

  it('should refresh the auth token', () => {
    instance.refreshToken();
    expect(fn).toHaveBeenCalled();
  });

});
