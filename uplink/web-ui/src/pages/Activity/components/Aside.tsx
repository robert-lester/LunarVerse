import * as React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  IconNames,
  IconSize,
  MonthPicker,
  Section,
  UnassignedPhone,
  UserInitials,
  Dropdown,
  Icon,
  Loading,
  SectionTitle,
  Search
} from '../../../components';
import './Aside.scss';
import { DropdownItem } from '../../../components/Dropdown/Dropdown';
import { GlobalState, MessageType } from '../../../types';
import { IconColor } from '../../../components/Icon/Icon';
import { Months, MonthYear } from '../../../components/MonthPicker/MonthPicker';
import { UserNumber, DateRange } from '../../../apollo/types';
import { formatSearchNumber } from '../../../utils';
import { setActivitySelectedNumber, setActivityDateRange, setMessageType, clearActivitySelectedNumbers } from '../../../actions';

interface MapStateToProps {
  readonly dateRange: DateRange;
  readonly messageType: MessageType;
  readonly selectedUserNumbers: UserNumber[];
  readonly userNumbers: UserNumber[] | null;
}

interface MapDispatchToProps {
  clearSelectedUserNumbers: () => void;
  setDateRange: (dateRange: MonthYear) => void;
  setMessageType: (messageType: MessageType) => void;
  setSelectedNumber: (userNumber: UserNumber) => void;
}

interface State {
  search: string;
}

type AsideProps = MapStateToProps & MapDispatchToProps;

export class Aside extends React.Component<AsideProps, State> {
  state: State = {
    search: '',
  };

  messageTypes = [
    {
      label: 'Inbound',
      value: 'inBound',
    },
    {
      label: 'Outbound',
      value: 'outBound',
    },
    {
      label: 'Inbound and Outbound',
      value: 'inboundOutbound',
    },
  ];

  componentWillUnmount() {
    this.props.clearSelectedUserNumbers();
  }

  /** Handles dates changes */
  handleDateChange = (month: Months, year: string) => {
    this.props.setDateRange({ month, year });
  }

  /** Handles message type change */
  handleMessageTypeChange = ({ value }: DropdownItem) => {
    this.props.setMessageType(value);
  }

  /** Handles search changes */
  handleSearchChange = ({ target: { value: search } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search });
  }

  /** Filters the list of User Numbers */
  filterNumberList = (item: UserNumber) => formatSearchNumber(item.systemNumber).includes(formatSearchNumber(this.state.search));

  /** Handles the selection of a number */
  handleNumberSelection = (userNumber: UserNumber) => {
    this.props.setSelectedNumber(userNumber);
  }

  /** Renders a single number */
  renderNumber = (userNumber: UserNumber) => {
    const { user, systemNumber, id } = userNumber;
    const isIncluded = !!this.props.selectedUserNumbers.find(selectedNumber => selectedNumber.id === id);
    return (
      <div
        className={`activity-aside__user-number ${isIncluded ? '--selected' : ''}`}
        onClick={() => this.handleNumberSelection(userNumber)}
        key={id}
      >
        <div className="activity-aside__user-info">
          {user
            ? <UserInitials
              name={user.name}
              userColor={user.color}
              selected={isIncluded}
              selectable={true}
              isAssigned={true}
            />
            : <UnassignedPhone selected={isIncluded} selectable={true} />
          }
          <div className="activity-aside__user-data">
            <div className="activity-aside__user-name">{user ? user.name : 'Unassigned'}</div>
            <b>{systemNumber}</b>
          </div>
        </div>
      </div>
    );
  }

  /** Gets the month and the year for Aside */
  getMonthYear = (dateRange: DateRange) => {
    const month = (dateRange.initial as moment.Moment).format('MMMM') as Months;
    const year = (dateRange.initial as moment.Moment).format('YYYY');
    return {
      month,
      year
    };
  }

  render() {
    const { userNumbers, dateRange, messageType } = this.props;
    const monthPickerDates = this.getMonthYear(dateRange);
    return (
      <>
        <Section>
          <SectionTitle title="Filter by month" />
          <MonthPicker
            month={monthPickerDates.month}
            year={monthPickerDates.year}
            onDatesChange={this.handleDateChange}
            canSelectFutureDate={false}
          />
        </Section>
        <Section>
          <SectionTitle title="Filter by type" />
          <div className="activity-aside__row">
            <Icon
              icon={IconNames.SWAP_HORIZONTAL}
              className="activity-aside__margin-right"
              color={IconColor.TWILIGHT}
              size={IconSize.SMALL}
            />
            <Dropdown
              items={this.messageTypes}
              onChange={this.handleMessageTypeChange}
              selectedItem={messageType}
              className="activity-aside__filter"
              type="secondary"
            />
          </div>
        </Section>
        <Section>
          <SectionTitle title="Filter by User Number" />
          <Search
            search={formatSearchNumber(this.state.search)}
            onChange={this.handleSearchChange}
            placeholder="Search by user number"
          />
          {!userNumbers && <Loading isGlobal={false} />}
          {userNumbers && userNumbers.filter(this.filterNumberList).map(this.renderNumber)}
          {userNumbers && !userNumbers.length && 'No user numbers exist.'}
        </Section>
      </>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  dateRange: state.activity.dateRange,
  messageType: state.activity.messageType,
  selectedUserNumbers: state.activity.selectedUserNumbers,
  userNumbers: state.userNumbers.allUserNumbers
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  clearSelectedUserNumbers: () => dispatch(clearActivitySelectedNumbers()),
  setDateRange: (dateRange: MonthYear) => dispatch(setActivityDateRange(dateRange)),
  setSelectedNumber: (userNumber: UserNumber) => dispatch(setActivitySelectedNumber(userNumber)),
  setMessageType: (messageType: MessageType) => dispatch(setMessageType(messageType))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Aside);
