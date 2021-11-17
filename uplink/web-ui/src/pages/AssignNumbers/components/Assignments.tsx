import * as React from 'react';
import { connect } from 'react-redux';

import { Assignment } from './';
import { Dropdown, Loading } from '../../../components';
import { GlobalState, ThunkDispatcher } from '../../../types';
import { UserNumber, UserNumberType } from '../../../apollo/types';
import './Assignments.scss';
import { getAllUserNumbersData } from '../../../actions';
import { DropdownItem } from '../../../components/Dropdown/Dropdown';

enum Filter {
  ALL_NUMBERS = 'allNumbers',
  ASSIGNED = 'assigned',
  FORWARDED = 'forwarded',
  NUMBERS_W_MESSAGES = 'numbersWithMessages',
  UNASSIGNED = 'unassigned'
}

interface State {
  filter: Filter;
}

const initialState = {
  filter: Filter.ALL_NUMBERS
};

interface MapDispatchToProps {
  getAllUserNumbersData: () => void;
}

interface MapStateToProps {
  readonly pendingNumberAssignments: UserNumber[];
  readonly allUserNumbers: UserNumber[] | null;
  readonly isAllUserNumbersDataLoading: boolean;
}

type AssignmentsProps = MapStateToProps & MapDispatchToProps;

export class Assignments extends React.Component<AssignmentsProps, State> {
  state: State = initialState;
  filters = [
    {
      value: 'allNumbers',
      label: 'All Numbers'
    },
    {
      value: 'assigned',
      label: 'Assigned Numbers'
    },
    {
      value: 'forwarded',
      label: 'Forwarded Numbers'
    },
    {
      value: 'unassigned',
      label: 'Unassigned Numbers'
    },
    {
      value: 'numbersWithMessages',
      label: 'Numbers with Messages',
    }
  ];

  componentDidMount() {
    this.props.getAllUserNumbersData();
  }

  /** Handles sorting changes */
  handleFilterChange = ({ value }: DropdownItem) => {
    this.setState({ filter: value });
  }

  /** Filters an assignment */
  filterAssignment = (userNumber: UserNumber) => {
    switch (this.state.filter) {
      case Filter.FORWARDED:
        return userNumber.type === UserNumberType.FORWARD;
      case Filter.ASSIGNED:
        return userNumber.type === UserNumberType.FORWARD || userNumber.type === UserNumberType.USER;
      case Filter.NUMBERS_W_MESSAGES:
        return userNumber.messages.length;
      case Filter.UNASSIGNED:
        return userNumber.type === UserNumberType.UNASSIGNED;
      default:
        return true;
    }

  }

  /** Renders the assignments */
  renderAssignments = () => {
    const { pendingNumberAssignments, allUserNumbers } = this.props;
    const assignments = pendingNumberAssignments.length
      ? pendingNumberAssignments
      : allUserNumbers;
    if (assignments) {
      const filteredAssignments = assignments.filter(this.filterAssignment);
      if (filteredAssignments && filteredAssignments.length) {
        return filteredAssignments.map((userNumber, index) => (
          <Assignment
            key={userNumber.id}
            zIndex={pendingNumberAssignments.length - index}
            userNumber={userNumber}
          />
        ));
      }
    }
    return 'No numbers exist.';
  }

  render() {
    return (
      <main>
        <div className="assign-numbers-assignments__actions">
          <Dropdown
            items={this.filters}
            onChange={this.handleFilterChange}
            selectedItem={this.state.filter}
            className="assign-numbers-assignments__filter"
            type="secondary"
          />
          <h3>Assignment</h3>
        </div>
        {this.props.isAllUserNumbersDataLoading
          ? <Loading isGlobal={false} />
          : this.renderAssignments()
        }
      </main>
    );
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  getAllUserNumbersData: () => dispatch(getAllUserNumbersData())
});

const mapStateToProps = (state: GlobalState) => ({
  allUserNumbers: state.userNumbers.allUserNumbers,
  isAllUserNumbersDataLoading: state.userNumbers.isAllUserNumbersDataLoading,
  pendingNumberAssignments: state.assignNumbers.pendingNumberAssignments,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Assignments);
