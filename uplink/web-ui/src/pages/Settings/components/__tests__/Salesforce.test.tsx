import * as React from 'react';
import * as enzyme from 'enzyme';

import { Salesforce } from '../Salesforce';

describe('Salesforce', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Salesforce
        getIntegrationSettings={fn}
        saveSalesforceSettings={fn}
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