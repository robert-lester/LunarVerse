import * as React from 'react';
import * as enzyme from 'enzyme';

import { ModalContent } from '../Modal/components/ModalContent';

describe('ModalContent', () => {
  let wrapper: enzyme.ShallowWrapper;
  beforeEach(() => {
    const component = (
      <ModalContent>
        <div>Test</div>
      </ModalContent>
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});