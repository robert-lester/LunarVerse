import * as React from 'react';
import * as enzyme from 'enzyme';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-140154106-1', { testMode: true });

import { Activity } from '../Activity';
import { ChartType } from '../../../types';

describe('Activity', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Activity
        getAllUserNumbersData={fn}
        setChartType={fn}
        chartType={ChartType.ALL_MESSAGES}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
