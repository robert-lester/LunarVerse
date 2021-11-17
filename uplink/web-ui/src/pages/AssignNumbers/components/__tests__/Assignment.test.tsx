import * as React from 'react';
import * as enzyme from 'enzyme';

import { Assignment } from '../Assignment';
import { UserNumberType } from '../../../../apollo/types';

describe('Assignment', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <Assignment
        userNumber={{
          forward: null,
          id: 1,
          messages: [],
          systemNumber: '1234567788',
          type: UserNumberType.USER,
          user: {
            color: 'blue',
            directDialNumber: '1234567788',
            id: 2,
            name: 'Test',
            phoneNumber: null,
            physicalNumber: '1123345566',
            systemNumber: '2223334455',
            type: UserNumberType.USER
          },
          callOrText30Days: false
        }}
        zIndex={1}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});