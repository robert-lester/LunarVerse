import * as React from 'react';
import * as enzyme from 'enzyme';

import { DeleteUser } from '../DeleteUser';

describe('DeleteUser', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <DeleteUser
        isDeleteUserLoading={false}
        isDeleteUserModalOpen={false}
        userToDelete={{
          name: 'test',
          id: 1
        }}
        closeDeleteUserModal={fn}
        deleteUser={fn}
        toggleDeleteUserModal={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});