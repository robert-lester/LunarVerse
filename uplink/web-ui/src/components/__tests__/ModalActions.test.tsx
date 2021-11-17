import * as React from 'react';
import * as enzyme from 'enzyme';

import { ModalActions } from '../Modal/components/ModalActions';

describe('ModalActions', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <ModalActions>
        <div>Test</div>
      </ModalActions>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});