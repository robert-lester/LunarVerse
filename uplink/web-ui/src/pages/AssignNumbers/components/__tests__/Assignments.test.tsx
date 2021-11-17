import * as React from 'react';
import * as enzyme from 'enzyme';

import { Assignments } from '../Assignments';

describe('Assignment', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Assignments
        pendingNumberAssignments={[]}
        allUserNumbers={[]}
        isAllUserNumbersDataLoading={false}
        getAllUserNumbersData={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});