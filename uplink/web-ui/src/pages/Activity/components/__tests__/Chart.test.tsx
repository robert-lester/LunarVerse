import * as React from 'react';
import * as enzyme from 'enzyme';
import moment from 'moment';

import { Chart } from '../Chart';
import { MessageType, ChartType } from '../../../../types';

describe('Chart', () => {
  let wrapper: enzyme.ShallowWrapper;
  const fn = jest.fn();
  beforeEach(() => {
    const component = (
      <Chart
        chartData={null}
        chartType={ChartType.ALL_MESSAGES}
        dateRange={{
          initial: moment().startOf('month'),
          final: moment().endOf('month')
        }}
        messageType={MessageType.INBOUND}
        userNumbers={[]}
        isChartDataLoading={false}
        getChartData={fn}
      />
    );
    wrapper = enzyme.shallow(component);
  });

  it('should render', () => {
    expect(wrapper.length).toEqual(1);
  });
});
