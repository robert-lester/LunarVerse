import * as React from 'react';
import * as enzyme from 'enzyme';

import { PasswordValidation, ValidationStatus } from '../PasswordValidation';

describe('PasswordValidation', () => {
  let wrapper: enzyme.ShallowWrapper;
  let instance: PasswordValidation;
  beforeEach(() => {
    const component = (
      <PasswordValidation
        value={'test'}
      />
    );
    wrapper = enzyme.shallow(component);
    instance = wrapper.instance() as PasswordValidation;
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should return failing validation status', () => {
    expect(instance.getStatus(false)).toEqual(ValidationStatus.FAIL);
  });

  it('should return passing validation status', () => {
    expect(instance.getStatus(true)).toEqual(ValidationStatus.PASS);
  });
});
