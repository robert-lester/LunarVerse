import * as React from 'react';
import * as enzyme from 'enzyme';

import { CreateNewUser } from '../CreateNewUser';

describe('CreateNewUser', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <CreateNewUser
        isNewUserModalOpen={false}
        isCreateNewUserLoading={false}
        toggleNewUserModal={fn}
        createNewUser={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});