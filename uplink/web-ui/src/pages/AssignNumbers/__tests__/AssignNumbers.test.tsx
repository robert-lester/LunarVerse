import * as React from 'react';
import * as enzyme from 'enzyme';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-140154106-1', { testMode: true });

import { AssignNumbers } from '../AssignNumbers';

describe('AssignNumbers', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <AssignNumbers
        allUserNumbers={[]}
        isAllUserNumbersDataLoading={false}
        isNewUserModalOpen={false}
        isSaveNumberAssignmentsLoading={false}
        isUnassignedUsersDataLoading={false}
        pendingNumberAssignments={[]}
        pendingUnassignedUsers={[]}
        unassignedUsers={[]}
        discardPendingNumberAssignments={fn}
        getAllUserNumbers={fn}
        getUnassignedUsers={fn}
        getUsage={fn}
        saveNumberAssignments={fn}
        saveUsers={fn}
        toggleNewUserModal={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});