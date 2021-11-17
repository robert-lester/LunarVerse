import * as React from 'react';
import * as enzyme from 'enzyme';

import { SmartAdvocate } from '../SmartAdvocate';

describe('SmartAdvocate', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <SmartAdvocate
        getIntegrationSettings={fn}
        saveSmartAdvocateSettings={fn}
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