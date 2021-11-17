import * as React from 'react';
import moment from 'moment';

import {
  Button,
  BooleanChipGroup,
  BooleanChip,
  DatePicker,
  Icon,
  IconNames,
  IconColor,
  IconSize
} from '../../../../../../components';
import { DateRange } from '../../../../../../apollo/types';
import { Dates } from '../../../../../../components/DatePicker/DatePicker';
import './Filters.scss';
import { Sort } from '../../../../../../types';

interface Props {
  dateRange: DateRange;
  onClose: () => void;
  onSubmit: (newDateRange: DateRange, newSort: Sort) => void;
  sort: Sort;
}

interface State {
  calendarSize: number;
  isActive: boolean;
  newDateRange: DateRange;
  sortType: Sort;
}

export class Filters extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      calendarSize: 2,
      isActive: false,
      newDateRange: props.dateRange,
      sortType: props.sort,
    };
  }

  componentDidMount() {
    window.onresize = () => { this.handleCalendarResize() }
    this.handleCalendarResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleCalendarResize);
  }

  /** Handles number of calendar months based on viewport */
  handleCalendarResize = () => {
    if (document.body.clientWidth <= 610) {
      this.setState({ calendarSize: 1 });
    } else {
      this.setState({ calendarSize: 2 });
    }
  }

  /** Handles dates changes */
  handleDateChange = ({ startDate, endDate }: Dates) => {
    this.setState({ newDateRange: { initial: startDate, final: endDate } });
  }

  /** Handles the sort change */
  toggleBooleanChip = (sort: Sort) => {
    this.setState({ sortType: sort });
  }

  /** Checks whether the date should be selectable on the DatePicker */
  isDateOutsideRange = (day: any) => moment(day).isAfter(moment());

  /** Gets whether or not apply button should be active */
  getFiltersActiveState = () => {
    // Ensure date range is selected and different and sort is selected and different
    return this.props.dateRange === this.state.newDateRange
    && this.props.sort === this.state.sortType
    || (!this.state.newDateRange.final
    || !this.state.newDateRange.initial)
  }

  render() {
    const { onClose } = this.props;
    const { calendarSize, newDateRange, sortType } = this.state;
    const isApplyFiltersDisabled = this.getFiltersActiveState();
    return (
      <div className="l-filters">
        <div className="__header">
          <Icon
            icon={IconNames.CLOSE}
            color={IconColor.LIGHT}
            size={IconSize.LARGE}
            className="__close-filters"
            onClick={onClose}
          />
        </div>
        <div>
          <div className="__sort">
            <h3 className="__sort-title">Sort</h3>
            <BooleanChipGroup>
              <BooleanChip
                label="Ascending"
                value={Sort.ASC} 
                isActive={sortType === Sort.ASC}
                onClick={this.toggleBooleanChip}
              />
              <BooleanChip
                label="Descending"
                value={Sort.DESC}
                isActive={sortType === Sort.DESC}
                onClick={this.toggleBooleanChip}
              />
            </BooleanChipGroup>
          </div>
          <div className="__divider" />
          <div className="__filter">
            <h3>Filter</h3>
            <h4 className="__date-range-title">DATE RANGE</h4>
            <DatePicker
              startDate={newDateRange.initial}
              endDate={newDateRange.final}
              onDatesChange={this.handleDateChange}
              isOutsideRange={this.isDateOutsideRange}
              isAlwaysOpen={true}
              numberOfMonths={calendarSize}
            />
          </div>
        </div>
        <div className="__footer">
          <Button
            label="Apply Filters"
            disabled={isApplyFiltersDisabled}
            onClick={() => this.props.onSubmit(newDateRange, sortType)}
          />
        </div>
      </div>
    );
  }
}

export default Filters;