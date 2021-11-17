import * as React from 'react';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import {
  getUserColor,
  getIndividualContextData,
  getContextUsageData,
  getGroupedNumberData,
  sortDateAscending,
} from '../../../utils';
import {
  MATERIAL_COLORS
} from '../../../constants';
import './Chart.scss';
import { GlobalState, ThunkDispatcher, MessageType, ChartType } from '../../../types';
import { Loading } from '../../../components';
import { Usage, DateRange, UserNumber } from '../../../apollo/types';
import { connect } from 'react-redux';
import { getChartData } from '../../../actions';

interface MapStateToProps {
  readonly chartData: any;
  readonly chartType: ChartType;
  readonly dateRange: DateRange;
  readonly messageType: MessageType;
  readonly userNumbers: UserNumber[];
  readonly isChartDataLoading: boolean;
}

interface MapDispatchToProps {
  getChartData: () => void;
}

type ChartProps = MapStateToProps & MapDispatchToProps;

export class Chart extends React.Component<ChartProps> {
  componentDidMount() {
    this.props.getChartData();
  }

  componentDidUpdate(prevProps: ChartProps) {
    if (!this.props.isChartDataLoading
      && (prevProps.chartType !== this.props.chartType
        || prevProps.messageType !== this.props.messageType
        || prevProps.dateRange !== this.props.dateRange
        || prevProps.userNumbers !== this.props.userNumbers)) {
      this.props.getChartData();
    }
  }

  /** Gets data total */
  renderCount = () => (
    <div className="activity-chart__total">
      <h4 className="activity-chart__total-count">Total</h4>
      <h2>
        {this.props.chartData ? this.getTotalCount() : 0} {this.props.chartType === 'voice' ? 'Minutes' : 'Messages'}
      </h2>
    </div>
  )

  // TODO: Can we shrink this logic down? Looks redundant
  /** Formats the chart data for use on the Chart */
  formatChartData = (queryResult: Usage) => {
    const { userNumbers, messageType, chartType } = this.props;
    let data: any[];
    // If on per user data
    if (userNumbers.length) {
      const context = queryResult.usageByPhone;
      switch (chartType) {
        case ChartType.VOICE:
          data = context.map(phone => getIndividualContextData(phone, 'voice', messageType, chartType));
          break;
        case ChartType.MEDIA:
          data = context.map(phone => getIndividualContextData(phone, 'message', messageType, chartType));
          break;
        case ChartType.SMS:
          data = context.map(phone => getIndividualContextData(phone, 'message', messageType, chartType));
          break;
        default:
          // All messages
          data = context.map(phone => getIndividualContextData(phone, 'message', messageType, chartType));
          break;
      }
    } else {
      const context = queryResult.usage;
      switch (chartType) {
        case ChartType.VOICE:
          data = getContextUsageData(context, 'voice', messageType, chartType);
          break;
        case ChartType.MEDIA:
          data = getContextUsageData(context, 'message', messageType, chartType);
          break;
        case ChartType.SMS:
          data = getContextUsageData(context, 'message', messageType, chartType);
          break;
        default:
          // All messages
          data = getContextUsageData(context, 'message', messageType, chartType);
          break;
      }
    }
    data = getGroupedNumberData(data);
    return data.sort((a, b) => sortDateAscending(a, b, 'name'));
  }

  /** Gets the total count for  */
  getTotalCount = (): number => {
    const {
      messageType,
      chartType,
      chartData
    } = this.props;
    const { totals: { message, voice } } = chartData as Usage;
    // Inbound and outbound totals
    if (messageType === MessageType.INBOUND_OUTBOUND) {
      if (chartType === ChartType.ALL_MESSAGES) {
        return message.inBoundMediaMessages.count + message.inBoundSMS.count + message.outBoundMediaMessages.count + message.outBoundSMS.count;
      }
      if (chartType === ChartType.MEDIA) {
        return message.inBoundMediaMessages.count + message.outBoundMediaMessages.count;
      }
      if (chartType === ChartType.SMS) {
        return message.inBoundSMS.count + message.outBoundSMS.count;
      }
      // Voice
      return voice.inBound.count + voice.outBound.count;
    }
    // Inbound
    if(messageType === MessageType.INBOUND) {
      if (chartType === ChartType.ALL_MESSAGES) {
        return message.inBoundMediaMessages.count + message.inBoundSMS.count;
      }
      if (chartType === ChartType.MEDIA) {
        return message.inBoundMediaMessages.count;
      }
      if (chartType === ChartType.SMS) {
        return message.inBoundSMS.count;
      }
      // Voice
      return voice.inBound.count;
    }
    // Outbound
    if(messageType === MessageType.OUTBOUND) {
      if (chartType === ChartType.ALL_MESSAGES) {
        return message.outBoundMediaMessages.count + message.outBoundSMS.count;
      }
      if (chartType === ChartType.MEDIA) {
        return message.outBoundMediaMessages.count;
      }
      if (chartType === ChartType.SMS) {
        return message.outBoundSMS.count;
      }
      // Voice
      return voice.outBound.count;
    }
    return 0;
  }

  /** Renders the colored area for a User Number */
  renderUserNumberArea = (userNumber: UserNumber) => {
    const colorName = userNumber.user && userNumber.user.color;
    const color = getUserColor(colorName);
    return (
      <Area
        type="monotone"
        dataKey={userNumber.systemNumber}
        stroke={color}
        fill={color}
        activeDot={{ r: 6 }}
        key={userNumber.systemNumber}
        connectNulls={true}
      />
    );
  }

  render() {
    const { chartData, isChartDataLoading } = this.props;
    if (isChartDataLoading) {
      return <Loading isGlobal={false} />;
    }
    return (
      <>
        {this.renderCount()}
        <div className="activity-chart">
          {!chartData && (
            <div className="activity-chart__no-data">
              No data exists for selected filters.
            </div>
          )
          }
          <ResponsiveContainer>
            <AreaChart data={chartData ? this.formatChartData(chartData) : []} >
              <CartesianGrid strokeDasharray="3 10" />
              <XAxis dataKey="name" tickMargin={12} />
              <YAxis tickMargin={12} allowDecimals={false}/>
              <Tooltip />
              <Area type="monotone" dataKey="Inbound" stroke={MATERIAL_COLORS.blue} fill={MATERIAL_COLORS.blue} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="Outbound" stroke={MATERIAL_COLORS.green} fill={MATERIAL_COLORS.green} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="Inbound and Outbound" stroke={MATERIAL_COLORS.purple} fill={MATERIAL_COLORS.purple} activeDot={{ r: 6 }} />
              {this.props.userNumbers.map(this.renderUserNumberArea)}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  chartData: state.activity.chartData,
  chartType: state.activity.chartType,
  dateRange: state.activity.dateRange,
  isChartDataLoading: state.activity.isChartDataLoading,
  messageType: state.activity.messageType,
  userNumbers: state.activity.selectedUserNumbers
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  getChartData: () => dispatch(getChartData())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chart);
