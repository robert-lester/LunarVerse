import * as React from 'react';
import moment from 'moment';

import './MonthPicker.scss';
import { Icon, IconSize, IconNames, Dropdown } from '../';
import { IconColor } from '../Icon/Icon';
import { DropdownSize, DropdownItem } from '../Dropdown/Dropdown';

export type Months =
  'January' |
  'February' |
  'March' |
  'April' |
  'May' |
  'June' |
  'July' |
  'August' |
  'September' |
  'October' |
  'November' |
  'December'
  ;

export interface MonthYear {
  month: Months;
  year: string;
}

interface Props {
  month?: Months;
  year?: string;
  canSelectFutureDate?: boolean;
  onDatesChange: (month: Months, year: string) => void;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default class DatePicker extends React.PureComponent<Props> {
  static defaultProps = {
    month: moment().format('MMMM'),
    year: moment().format('YYYY'),
    canSelectFutureDate: true
  };

  months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ].map(month => ({ value: month, label: month }));
  years: DropdownItem[];

  constructor(props: Props) {
    super(props);
    this.years = this.getYears();
  }

  /** Gets the past 10 years */
  getYears = () => {
    const currentYear = Number(moment().format('YYYY'));
    return Array.from(Array(10), (_, i) => ({
      value: currentYear - i,
      label: currentYear - i
    }));
  }

  /** Gets months */
  getMonths = () => {
    let filteredMonths = months;
    // Disable certain months
    if (!this.props.canSelectFutureDate) {
      filteredMonths = months.filter(month => moment(`${month} ${this.props.year}`, 'MMMM YYYY').isBefore(moment()));
    }
    return filteredMonths.map(month => ({ value: month, label: month }));
  }

  /** Handles the month change */
  handleMonthChange = (month: DropdownItem) => {
    this.props.onDatesChange(month.value, this.props.year as string);
  }

  /** Handles the year change */
  handleYearChange = (year: DropdownItem) => {
    this.props.onDatesChange(this.props.month as Months, year.value);
  }
  render() {
    const availableMonths = this.getMonths();
    return (
      <div className="l-month-picker">
        <Icon
          icon={IconNames.DATE_RANGE}
          size={IconSize.SMALL}
          color={IconColor.TWILIGHT}
          className="l-month-picker__icon"
        />
        <Dropdown
          items={availableMonths}
          onChange={this.handleMonthChange}
          selectedItem={this.props.month}
        />
        <Dropdown
          items={this.years}
          onChange={this.handleYearChange}
          selectedItem={Number(this.props.year)}
          className="l-month-picker__year"
          size={DropdownSize.SMALL}
        />
      </div>
    );
  }
}
