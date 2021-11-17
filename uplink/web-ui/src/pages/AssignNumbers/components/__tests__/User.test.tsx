import * as React from 'react';
import * as enzyme from 'enzyme';

import { UserPure } from '../';
import { UserNumberType } from '../../../../apollo/types';

describe('User', () => {
  let shallow: enzyme.ShallowWrapper;
  const fn = jest.fn();
  const onActionViewChange = jest.fn();
  beforeEach(() => {
    const component = (
      <UserPure
        forwardableUserNumbersList={[]}
        onActionViewChange={onActionViewChange}
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
        currentView="assign"
        phone="1234567788"
        color="blue"
        id={1}
        name="Test"
        userNumber={{
          forward: null,
          id: 1,
          messages: [],
          systemNumber: '1234567788',
          type: UserNumberType.USER,
          user: {
            color: 'blue',
            directDialNumber: '1234567788',
            id: 1,
            name: 'Test',
            phoneNumber: null,
            physicalNumber: '1234567788',
            systemNumber: '1234567788',
            type: UserNumberType.USER
          },
          callOrText30Days: false
        }}
      />
    );
    shallow = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(shallow.length).toEqual(1);
  });

  // TODO: Continue after GH migration
  // it('should handle action view change', () => {
  //   const portalDiv = document.createElement('DIV');
  //   portalDiv.id = 'pop-up-portal';
  //   document.body.appendChild(portalDiv);
  //   mount.find('.assign-numbers-user__edit-icon .l-icon').simulate('click');
  //   const popUpPortal = document.getElementById('pop-up-portal');
  //   if (popUpPortal) {
  //     // TODO: Need to be finished
  //   }
  //   expect(onActionViewChange).toBeCalled();
  // });
});