import * as React from 'react';
import * as enzyme from 'enzyme';

import { EditUser } from '../EditUser';

describe('EditUser', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <EditUser
        isEditUserModalOpen={false}
        isDeleteUserModalOpen={false}
        userToEdit={{
          name: 'test',
          phone: '1234567788',
          id: 1
        }}
        toggleEditUserModal={fn}
        toggleDeleteUserModal={fn}
        updateUser={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});