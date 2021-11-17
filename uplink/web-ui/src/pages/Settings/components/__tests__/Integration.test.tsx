import * as React from 'react';
import * as enzyme from 'enzyme';

import { Integration } from '../Integration';

describe('Integration', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Integration
        integrationTitle="test"
        integrationDescription="test"
        integrationToken="token"
        flags={{
          syncCalls: false,
          syncMessages: false,
          syncRecords: false
        }}
        pollingInterval={{
          increment: 1,
          unit: "test"
        }}
        lastSuccessfulSync={1}
        isIntegrationLoading={false}
        saveIntegrationSettings={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should invoke handleCopyContent method on click', () => {
    const instance = wrapper.instance() as Integration;
    jest.spyOn(instance, 'handleCopyContent');
    wrapper.find('.__token-text').first().simulate('click');
    wrapper.find('.__token-text').last().simulate('click');
    expect(instance.handleCopyContent).toHaveBeenCalledTimes(2);
  })

  it('should set state feature enabled', () => {
    const instance = wrapper.instance() as Integration;
    instance.handleFeatureSwitch();
    expect(wrapper.state('syncRecords')).toEqual(true);
  });

  it('should set state feature disabled', () => {
    const instance = wrapper.instance() as Integration;
    wrapper.setState({ syncRecords: true });
    instance.handleFeatureSwitch();
    expect(wrapper.state('syncRecords')).toEqual(false);
  });

  it('should set state messages enabled', () => {
    const instance = wrapper.instance() as Integration;
    instance.handleMessagesSwitch();
    expect(wrapper.state('syncMessages')).toEqual(true);
  });

  it('should set state messages disabled', () => {
    const instance = wrapper.instance() as Integration;
    wrapper.setState({ syncMessages: true });
    instance.handleMessagesSwitch();
    expect(wrapper.state('syncMessages')).toEqual(false);
  });

  it('should set state phone calls enabled', () => {
    const instance = wrapper.instance() as Integration;
    instance.handlePhoneCallsSwitch();
    expect(wrapper.state('syncCalls')).toEqual(true);
  });

  it('should set state phone calls disabled', () => {
    const instance = wrapper.instance() as Integration;
    wrapper.setState({ syncCalls: true });
    instance.handlePhoneCallsSwitch();
    expect(wrapper.state('syncCalls')).toEqual(false);
  });

  it('should render the loader', () => {
    wrapper.setProps({ isIntegrationLoading: true });
    expect(wrapper.find('.integration__loading')).toHaveLength(1);
  });
});