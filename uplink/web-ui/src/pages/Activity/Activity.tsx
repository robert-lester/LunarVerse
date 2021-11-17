import * as React from 'react';
import { connect } from 'react-redux';
import ReactGA from 'react-ga';

import './Activity.scss';
import { Aside, Chart } from './components';
import { Content, Header } from '../components/';
import { GlobalState, ThunkDispatcher, ChartType } from '../../types';
import { Menu, Dropdown, IconNames } from '../../components/';
import { getAllUserNumbersData, setChartType } from '../../actions';
import { DropdownSize, DropdownItem } from '../../components/Dropdown/Dropdown';

interface MapDispatchToProps {
  getAllUserNumbersData: () => void;
  setChartType: (chartType: ChartType) => void;
}

interface MapStateToProps {
  readonly chartType: ChartType;
}

type ActivityProps = MapDispatchToProps & MapStateToProps;

export class Activity extends React.Component<ActivityProps> {
  chartTypes = [
    {
      value: ChartType.VOICE,
      label: 'Minutes'
    },
    {
      value: ChartType.ALL_MESSAGES,
      label: 'All Messages'
    },
    {
      value: ChartType.SMS,
      label: 'SMS Messages'
    },
    {
      value: ChartType.MEDIA,
      label: 'Media Messages'
    },
  ];

  componentDidMount() {
    ReactGA.pageview(window.location.pathname);
    this.props.getAllUserNumbersData();
  }

  setChartType = ({ value }: DropdownItem) => {
    this.props.setChartType(value);
  }

  render() {
    return (
      <>
        <Menu icon={IconNames.TIMELINE} title="Activity">
          <Aside/>
        </Menu>
        <Header >
          <Dropdown
            items={this.chartTypes}
            onChange={this.setChartType}
            selectedItem={this.props.chartType}
            size={DropdownSize.MEDIUM}
            className="activity__dropdown"
            type="secondary"
          />
        </Header>
        <Content>
          <Chart/>
        </Content>
      </>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  chartType: state.activity.chartType
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  getAllUserNumbersData: () => dispatch(getAllUserNumbersData()),
  setChartType: (chartType: ChartType) => dispatch(setChartType(chartType))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Activity);
