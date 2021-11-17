import * as React from 'react';
import * as enzyme from 'enzyme';

import { PhonePure } from '../';

describe('Phone', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <PhonePure
        forwardableUserNumbersList={[]}
        onActionViewChange={fn}
        onCreateNewUser={fn}
        onPopoverClose={fn}
        onToggleDefaultView={fn}
        onToggleEditUserModal={fn}
        onToggleNewUserModal={fn}
        onTogglePopoverActions={fn}
        onToggleWillAssignNewUser={fn}
        onUnassignUser={fn}
        onUnassignUserNumber={fn}
        unassignedUsersList={[]}
        anchorElement={null}
        currentView="Edit Assignment"
        phoneNumber="1234567788"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});