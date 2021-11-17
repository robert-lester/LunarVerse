import * as React from 'react';
import moment from 'moment';
import { DateRangePicker, FocusedInputShape } from 'react-dates';

import './DatePicker.scss';
import { Icon, IconSize, IconNames } from '../';
import { IconColor } from '../Icon/Icon';

export interface Dates {
  startDate: moment.Moment | null;
  endDate: moment.Moment | null;
}

interface Props {
  startDate: moment.Moment | null;
  endDate: moment.Moment | null;
  onDatesChange: (dates: Dates) => void;
  isDayBlocked?: (day: any) => boolean;
  isOutsideRange?: (day: any) => boolean;
  appendToBody?: boolean;
  isAlwaysOpen?: boolean;
  numberOfMonths?: number;
}

interface State {
  focusedDateInput: FocusedInputShape | null;
}

export default class DatePicker extends React.Component<Props, State> {
  state: State = {
    focusedDateInput: this.props.isAlwaysOpen ? 'startDate' : null,
  };

  /** Handles dates changes */
  handleDateFocusChange = (focusedDateInput: FocusedInputShape | null) => {
    if (this.props.isAlwaysOpen) {
      if (!focusedDateInput) return;
      this.setState({ focusedDateInput });
    }
    this.setState({ focusedDateInput });
  }

  render() {
    const { isAlwaysOpen, ...rest } = this.props;
    return (
      <div className="l-datepicker">
        <Icon
          icon={IconNames.DATE_RANGE}
          size={IconSize.SMALL}
          color={IconColor.TWILIGHT}
          className="l-datepicker__icon"
        />
        <DateRangePicker
          startDateId="start-date"
          endDateId="end-date"
          focusedInput={this.state.focusedDateInput}
          onFocusChange={this.handleDateFocusChange}
          noBorder={true}
          small={true}
          hideKeyboardShortcutsPanel={true}
          {...rest}
        />
      </div>
    );
  }
}
