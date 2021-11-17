import * as React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import ReactGA from 'react-ga';

import './AssignNumbers.scss';
import { Assignments, Aside, CreateNewUser } from './components';
import { Content, Header } from '../components';
import { Menu, NavigationPrompt, IconButton, Icon, IconNames } from '../../components';
import { User, UserNumber } from '../../apollo/types';
import { IconColor } from '../../components/Icon/Icon';
import { GlobalState, ThunkDispatcher } from '../../types';
import {
  discardPendingNumberAssignments,
  getAllUserNumbersData,
  getUnassignedUsersData,
  getUsageData,
  saveNumberAssignments,
  saveUsers,
  toggleNewUserModal
} from '../../actions';
import EditUser from './components/EditUser';
import DeleteUser from './components/DeleteUser';
import { IconButtonType } from '../../components/IconButton/IconButton';

interface MapDispatchToProps {
  discardPendingNumberAssignments: () => void;
  getAllUserNumbers: () => void;
  getUnassignedUsers: () => void;
  getUsage: () => void;
  saveNumberAssignments: () => void;
  saveUsers: () => void;
  toggleNewUserModal: () => void;
}

interface MapStateToProps {
  readonly allUserNumbers: UserNumber[] | null;
  readonly isAllUserNumbersDataLoading: boolean;
  readonly isNewUserModalOpen: boolean;
  readonly isSaveNumberAssignmentsLoading: boolean;
  readonly isUnassignedUsersDataLoading: boolean;
  readonly pendingNumberAssignments: UserNumber[];
  readonly pendingUnassignedUsers: User[];
  readonly unassignedUsers: User[] | null;
}

type AssignNumbersProps = MapStateToProps & MapDispatchToProps;

export class AssignNumbers extends React.Component<AssignNumbersProps> {
  componentDidMount() {
    ReactGA.pageview(window.location.pathname);
  }

  /** Handles changes save by checking against original data
   * and updated data to ensure only changed users get updated
   */
  handleSave = async () => {
    // Save all users only if changes exist
    await this.props.saveUsers();
    await this.props.saveNumberAssignments();
    await this.props.getAllUserNumbers();
    await this.props.getUnassignedUsers();
    this.props.getUsage();
  }

  render() {
    const {
      allUserNumbers,
      isAllUserNumbersDataLoading,
      isSaveNumberAssignmentsLoading,
      isUnassignedUsersDataLoading,
      pendingNumberAssignments,
      pendingUnassignedUsers,
      unassignedUsers
    } = this.props;
    const assignmentChanges = isEqual(pendingNumberAssignments, allUserNumbers);
    const unassignedUserChanges = isEqual(pendingUnassignedUsers, unassignedUsers);
    const isButtonDisabled = (assignmentChanges && unassignedUserChanges) || (isSaveNumberAssignmentsLoading || isAllUserNumbersDataLoading || isUnassignedUsersDataLoading);
    return (
      <div className="assign-numbers">
        <NavigationPrompt when={!assignmentChanges} />
        <Menu icon={IconNames.PERSON} title="Assign Numbers">
          <Aside />
        </Menu>
        <Content>
          <Header>
            <IconButton
              label="Save"
              Icon={<Icon icon={IconNames.SAVE} color={IconColor.LIGHT} />}
              onClick={this.handleSave}
              type={IconButtonType.POSITIVE}
              disabled={isButtonDisabled}
              className="__save"
            />
            <IconButton
              label="Discard"
              Icon={<Icon icon={IconNames.CLOSE} color={IconColor.TWILIGHT} />}
              onClick={this.props.discardPendingNumberAssignments}
              type={IconButtonType.GHOST}
              disabled={isButtonDisabled}
            />
          </Header>
          <Assignments />
        </Content>
        <CreateNewUser />
        <EditUser />
        <DeleteUser />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
  discardPendingNumberAssignments: () => dispatch(discardPendingNumberAssignments()),
  getAllUserNumbers: () => dispatch(getAllUserNumbersData()),
  getUnassignedUsers: () => dispatch(getUnassignedUsersData()),
  getUsage: () => dispatch(getUsageData()),
  saveNumberAssignments: () => dispatch(saveNumberAssignments()),
  saveUsers: () => dispatch(saveUsers()),
  toggleNewUserModal: () => dispatch(toggleNewUserModal())
});

const mapStateToProps = (state: GlobalState) => ({
  allUserNumbers: state.userNumbers.allUserNumbers,
  isAllUserNumbersDataLoading: state.userNumbers.isAllUserNumbersDataLoading,
  isNewUserModalOpen: state.user.isNewUserModalOpen,
  isSaveNumberAssignmentsLoading: state.assignNumbers.isSaveNumberAssignmentsLoading,
  isUnassignedUsersDataLoading: state.users.isUnassignedUsersDataLoading,
  pendingNumberAssignments: state.assignNumbers.pendingNumberAssignments,
  pendingUnassignedUsers: state.assignNumbers.pendingUnassignedUsers,
  unassignedUsers: state.users.unassignedUsers
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignNumbers);
