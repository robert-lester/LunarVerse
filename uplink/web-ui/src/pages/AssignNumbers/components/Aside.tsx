import * as React from 'react';
import { connect } from 'react-redux';

import {
  Icon,
  Loading,
  PercentageCircle,
  Section,
  SectionTitle,
  Button,
  UserInitials,
  IconNames,
  IconColor,
  Search
} from '../../../components';
import { GetUserNumberUsageData, User } from '../../../apollo/types';
import './Aside.scss';
import { ThunkDispatcher, GlobalState } from '../../../types';
import { getUnassignedUsersData, getUsageData, toggleEditUserModal, toggleNewUserModal } from '../../../actions';
import { UserToEdit } from './EditUser';
import { formatUserNumber } from '../../../utils';

interface MapDispatchToProps {
  getUnassignedUsers: () => void;
  getUsage: () => void;
  toggleEditUserModal: (userToEdit: UserToEdit) => void;
  toggleNewUserModal: () => void;
}

interface MapStateToProps {
  readonly isGetUsageDataLoading: boolean;
  readonly isUnassignedUsersDataLoading: boolean;
  readonly unassignedUsers: User[] | null;
  readonly usage: GetUserNumberUsageData | null;
}

interface State {
  search: string;
}

type AsideProps = MapDispatchToProps & MapStateToProps;

export class Aside extends React.Component<AsideProps, State> {
  state: State = {
    search: '',
  };

  componentDidMount() {
    this.props.getUnassignedUsers();
    this.props.getUsage();
  }

  /** Toggles edit user modal state for modifying user information */
  handleEditUser = (id: number, name: string, physicalNumber: string) => {
    this.props.toggleEditUserModal({
      name: name,
      phone: physicalNumber,
      id: id
    });
  }

  /** Renders a single number */
  renderUser = ({ color, id, name, physicalNumber }: User) => (
    <li
      className="assign-numbers-aside__user"
      key={id}
      onClick={() => this.handleEditUser(id, name, physicalNumber)}
    >
      <div className="assign-numbers-aside__user-info">
        <UserInitials
          name={name}
          userColor={color}
        />
        <div className="assign-numbers-aside__user-data">
          <div className="assign-numbers-aside__user-name">{name}</div>
          <b>{formatUserNumber(physicalNumber)}</b>
        </div>
        <Icon
          className="assign-numbers-aside__edit-icon"
          icon={IconNames.EDIT}
          color={IconColor.TWILIGHT}
        />
      </div>
    </li>
  )

  /** Handles search changes */
  handleSearchChange = ({ target: { value: search } }: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ search });
  }

  /** Filters the list of Users */
  filterUserList = (item: User) => item.name ? item.name.toLowerCase().includes(this.state.search.toLowerCase()) : '';

  /** Renders users for the list */
  renderUsers = () => {
    const { unassignedUsers, isUnassignedUsersDataLoading } = this.props;
    if (isUnassignedUsersDataLoading || !unassignedUsers) {
      return <Loading isGlobal={false} />;
    }
    return unassignedUsers && unassignedUsers.length
      ? (
        <ul className="assign-numbers-aside__unassigned-users">
          {unassignedUsers.filter(this.filterUserList).map(this.renderUser)}
        </ul>
      )
      : 'No unassigned users exist.';
  }

  /** Renders usage counts */
  renderUsageCounts = (usage: GetUserNumberUsageData | null) => {
    const usageData = usage && usage.getPlan;
    return (
      <>
        <h1>{Aside.getUsagePercentage(usage)}%</h1>
        <h3>
          <span className="assign-numbers-aside__usage-number">
            {usageData ? usageData.numbers.used : 0}
          </span> of {usageData ? usageData.numbers.included : 0}
        </h3>
      </>
    );
  }

  /** Renders the percentage circle */
  renderPercentageCircle = () => {
    const { isGetUsageDataLoading, usage } = this.props;
    if (isGetUsageDataLoading) {
      return <Loading isGlobal={false} />;
    }
    return (
      <PercentageCircle
        percent={Aside.getUsagePercentage(usage)}
        className="assign-numbers-aside__percentage-circle"
      >
        {this.renderUsageCounts(usage)}
      </PercentageCircle>
    );
  }

  static getUsagePercentage(data: GetUserNumberUsageData | null) {
    if (data && data.getPlan && data.getPlan.numbers.included) {
      return Math.round((data.getPlan.numbers.used / data.getPlan.numbers.included) * 100);
    }
    return 0;
  }

  render() {
    return (
      <>
        <Section>
          <SectionTitle title="User Number Usage" />
          {this.renderPercentageCircle()}
        </Section>
        <Section>
          <Button label="Create User" className="assign-numbers-aside__create-user" onClick={this.props.toggleNewUserModal} />
          <SectionTitle title="Unassigned Users" />
          <Search
            search={this.state.search}
            onChange={this.handleSearchChange}
            placeholder="Search by user name"
          />
          {this.renderUsers()}
        </Section>
      </>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isGetUsageDataLoading: state.plan.isGetUsageDataLoading,
  isUnassignedUsersDataLoading: state.users.isUnassignedUsersDataLoading,
  unassignedUsers: state.assignNumbers.pendingUnassignedUsers,
  usage: state.plan.allUsage
});

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  getUnassignedUsers: () => dispatch(getUnassignedUsersData()),
  getUsage: () => dispatch(getUsageData()),
  toggleEditUserModal: (userToEdit: UserToEdit) => dispatch(toggleEditUserModal(userToEdit)),
  toggleNewUserModal: () => dispatch(toggleNewUserModal())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Aside);
