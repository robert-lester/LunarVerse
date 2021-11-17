import * as React from 'react';
import * as enzyme from 'enzyme';

import { Aside } from '../Aside';

describe('Aside', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Aside
        isGetUsageDataLoading={false}
        isUnassignedUsersDataLoading={false}
        unassignedUsers={[]}
        usage={null}
        getUnassignedUsers={fn}
        getUsage={fn}
        toggleEditUserModal={fn}
        toggleNewUserModal={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});