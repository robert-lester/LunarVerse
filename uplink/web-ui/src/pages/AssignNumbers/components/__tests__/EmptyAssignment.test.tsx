import * as React from 'react';
import * as enzyme from 'enzyme';

import { EmptyAssignmentPure } from '../';

describe('EmptyAssignmet', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <EmptyAssignmentPure
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
        currentView="test"
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});