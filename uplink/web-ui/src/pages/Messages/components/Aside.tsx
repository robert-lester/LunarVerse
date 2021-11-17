import * as React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import {
  DatePicker,
  Section,
  SectionTitle,
  UnassignedPhone,
  UserInitials,
  Loading,
  Radio,
  Search
} from '../../../components';
import './Aside.scss';
import { ContactNumberType } from '../../../reducers';
import { DateRange, UserNumber } from '../../../apollo/types';
import { Dates } from '../../../components/DatePicker/DatePicker';
import { GlobalState } from '../../../types';
import { RadioVariant } from '../../../components/Radio/Radio';
import { formatSearchNumber } from '../../../utils';
import { setMessagesDateRange, setMessagesSelectedNumber, getAllUserNumbersData, setSelectedContactNumberType } from '../../../actions';

interface MapStateToProps {
  readonly dateRange: DateRange;
  readonly selectedNumbers: string[];
  readonly selectedContactNumberType: ContactNumberType;
  readonly userNumbers: UserNumber[] | null;
  readonly isUserNumbersDataLoading: boolean;
}

interface MapDispatchToProps {
  setDateRange: (dateRange: DateRange) => void;
  setSelectedNumber: (userNumber: string) => void;
  setSelectedContactNumberType: (type: ContactNumberType) => void;
  getAllUserNumbersData: () => void;
}

interface State {
  search: string;
}

type AsideProps = MapStateToProps & MapDispatchToProps;

export class Aside extends React.PureComponent<AsideProps, State> {
  state: State = {
    search: ''
  };

  componentDidMount() {
    this.props.getAllUserNumbersData();
  }

  /** Handles dates changes */
  handleDateChange = ({ startDate, endDate }: Dates) => {
    const initial = startDate && startDate.startOf('day');
    const final = endDate ? endDate.isSame(moment(), 'day') ? endDate : endDate.endOf('day') : null;
    this.props.setDateRange({ initial, final });
  }

  /** Handles the selection of a number */
  handleNumberSelection = (userNumber: string) => {
    this.props.setSelectedNumber(userNumber);
  }

  /** Handles Contact Number type click */
  handleContactNumberTypeClick = ({ target: { value } }: any) => {
    this.props.setSelectedContactNumberType(value);
  }

  /** Handles search changes */
  handleSearchChange = ({ target: { value: search } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search });
  }

  /** Filters the list of User Numbers */
  filterNumberList = (item: UserNumber) => formatSearchNumber(item.systemNumber).includes(formatSearchNumber(this.state.search));

  /** Renders a single number */
  renderNumber = ({
    id, user, systemNumber
  }: UserNumber) => {
    const isIncluded = this.props.selectedNumbers.includes(systemNumber);
    return (
      <div
        className={`messages-aside__user-number ${isIncluded ? 'messages-aside__user-number--selected' : ''}`}
        onClick={() => this.handleNumberSelection(systemNumber)}
        key={id}
      >
        <div className="messages-aside__user-info">
          {user
            ? <UserInitials
              name={user.name !== null ? user.name : 'Unassigned'}
              userColor={user.color}
              selected={isIncluded}
              selectable={true}
              isAssigned={true}
            />
            : <UnassignedPhone selected={isIncluded} selectable={true} />
          }
          <div className="messages-aside__data">
            <div className="messages-aside__user-name">
              {user && user.name !== null ? user.name : 'Unassigned'}
            </div>
            {<b>{systemNumber}</b>}
          </div>
        </div>
      </div>
    );
  }

  /** Checks whether the date should be selectable on the DatePicker */
  isDateOutsideRange = (day: any) => moment(day).isAfter(moment().endOf('day'));

  render() {
    const { userNumbers, dateRange, selectedContactNumberType, isUserNumbersDataLoading } = this.props;
    return (
      <>
        <Section>
          <SectionTitle title="Filter by date range" />
          <DatePicker
            startDate={dateRange.initial}
            endDate={dateRange.final}
            onDatesChange={this.handleDateChange}
            isOutsideRange={this.isDateOutsideRange}
            appendToBody={true}
          />
        </Section>
        <Section>
          <SectionTitle title="Contact Number" />
          <Radio
            label="Real number"
            name="contact-number"
            value={ContactNumberType.REAL}
            checked={selectedContactNumberType === ContactNumberType.REAL}
            variant={RadioVariant.ON_DARK}
            onChange={this.handleContactNumberTypeClick}
          />
          <Radio
            label="Uplink number"
            name="contact-number"
            value={ContactNumberType.UPLINK}
            checked={selectedContactNumberType === ContactNumberType.UPLINK}
            variant={RadioVariant.ON_DARK}
            onChange={this.handleContactNumberTypeClick}
          />
        </Section>
        <Section>
          {isUserNumbersDataLoading
            ? <Loading isGlobal={false} />
            : (
              <>
                <SectionTitle title="Filter by User Number" />
                <Search
                  search={formatSearchNumber(this.state.search)}
                  onChange={this.handleSearchChange}
                  placeholder="Search by user number"
                />
                {userNumbers && userNumbers.length
                  ? userNumbers.filter(this.filterNumberList).map(this.renderNumber)
                  : 'No user numbers exist.'
                }
              </>
            )
          }
        </Section>
      </>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  dateRange: state.messages.dateRange,
  selectedNumbers: state.messages.selectedUserNumbers,
  userNumbers: state.userNumbers.allUserNumbers,
  selectedContactNumberType: state.messages.selectedContactNumberType,
  isUserNumbersDataLoading: state.userNumbers.isAllUserNumbersDataLoading
});

export const mapDispatchToProps = {
  setDateRange: (dateRange: DateRange) => setMessagesDateRange(dateRange),
  setSelectedNumber: (userNumber: string) => setMessagesSelectedNumber(userNumber),
  setSelectedContactNumberType: (type: ContactNumberType) => setSelectedContactNumberType(type),
  getAllUserNumbersData: () => getAllUserNumbersData()
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Aside);
