import * as React from 'react';
import * as enzyme from 'enzyme';

import { Plan } from '../Plan';

describe('Plan', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Plan
        plan={null}
        isPlanDataLoading={false}
        getPlanData={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });

  it('should invoke handleCopyContent method on click', () => {
    const instance = wrapper.instance() as Plan;
    jest.spyOn(instance, 'handleCopyContent');
    wrapper.find('.__sf-info').first().simulate('click');
    wrapper.find('.__sf-info').last().simulate('click');
    expect(instance.handleCopyContent).toHaveBeenCalledTimes(2);
  })

  it('should render the loader', () => {
    wrapper.setProps({ isPlanDataLoading: true });
    expect(wrapper.find('.plan__loading')).toHaveLength(1);
  });

  it('should return an known usage range', () => {
    wrapper.setProps({
      plan: {
        sfToken: '',
        numbers: {
          used: 0,
          included: 0
        },
        usage: {
          smsMessages: 0,
          mmsMessages: 0,
          voiceMinutes: 0
        },
        usageCycle: {
          endDate: '2019-10-20',
          startDate: '2019-10-10'
        }
      }
    });
    const instance = wrapper.instance() as Plan;
    expect(instance.getUsageRange()).toEqual('10/10/2019 - 10/20/2019');
  })
}); 