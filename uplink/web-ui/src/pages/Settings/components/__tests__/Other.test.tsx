import * as React from 'react';
import * as enzyme from 'enzyme';

import { GenericCRM } from '../Other';

describe('GenericCRM', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <GenericCRM
        getIntegrationSettings={fn}
        saveGenericCRMSettings={fn}
        isIntegrationSettingsLoading={false}
        integrationSettings={null}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});