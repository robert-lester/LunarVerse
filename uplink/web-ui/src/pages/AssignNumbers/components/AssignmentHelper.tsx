import * as React from 'react';
import { connect } from 'react-redux';

import { GlobalState, ThunkDispatcher } from '../../../types';
import { User, UserNumber, GetUsersList, UserNumberType } from '../../../apollo/types';
import { assignUser, unassignUserNumber, forwardUserNumber, toggleNewUserModal, toggleWillAssignNewUser, toggleEditUserModal, unassignUser } from '../../../actions';
import { UserInitials, UserInitialsSize, PhoneType, PhoneTypeSize, ListItem } from '../../../components';
import { UserToEdit } from './EditUser';
import { ListItemType } from '../../../components/ListItem/ListItem';

interface State {
  anchorElement: null | HTMLElement | ((element: HTMLElement) => HTMLElement);
  currentView: string;
}

interface MapDispatchToProps {
  assignUser: (user: User, userNumber: UserNumber) => void;
  forwardUserNumber: (forwardingNumber: UserNumber, userNumber: UserNumber) => void;
  toggleEditUserModal: (userToEdit: UserToEdit) => void;
  toggleNewUserModal: () => void;
  toggleWillAssignNewUser: (userNumber: UserNumber) => void;
  unassignUser: (user: User) => void;
  unassignUserNumber: (userNumberId: number, assignedUserNumber: string) => void;
}

interface MapStateToProps {
  readonly allUserNumbers: UserNumber[] | null;
  readonly isUnassignedUsersDataLoading: boolean;
  readonly pendingNumberAssignments: UserNumber[];
  readonly pendingUnassignedUsers: User[];
  readonly unassignedUsers: User[] | null;
}

export interface InjectedWithAssignerProps extends State {
  forwardableUserNumbersList: ListItemType[];
  onActionViewChange: (view: string) => void;
  onCreateNewUser: () => void;
  onPopoverClose: () => void;
  onToggleDefaultView: () => void;
  onToggleEditUserModal: () => void;
  onToggleNewUserModal: () => void;
  onTogglePopoverActions: (event: React.MouseEvent<HTMLElement>) => void;
  onToggleWillAssignNewUser: (userNumber: UserNumber) => void;
  onUnassignUser: () => void;
  onUnassignUserNumber: () => void;
  unassignedUsersList: ListItemType[];
}

interface WrappedComponentProps {
  userNumber?: UserNumber;
  id?: number | null;
}

type WithAssignerProps =
  InjectedWithAssignerProps
  & WrappedComponentProps
  & MapStateToProps
  & MapDispatchToProps;

export const withAssigner = <P extends InjectedWithAssignerProps>(
  WrappedComponent: React.ComponentType<P>
) => {
  class WithAssigner extends React.Component<any, State> {
    state = {
      anchorElement: null,
      currentView: 'assign'
    };

    /** Toggles PopoverActions */
    handleTogglePopoverActions = (event: React.MouseEvent<HTMLElement>) => {
      this.setState({
        anchorElement: event.currentTarget,
        currentView: 'assign'
      });
    }

    /** Toggles the default view */
    handleToggleDefaultView = () => {
      this.setState({
        currentView: 'assign'
      });
    }

    /** Handles action view changes */
    handleActionViewChange = (currentView: string) => {
      this.setState({ currentView });
    }

    /** Unassigns a User Number */
    handleUnassignUserNumber = () => {
      this.handlePopoverClose();
      this.props.unassignUserNumber(this.props.id as number, this.props.userNumber.systemNumber as string);
    }

    /** Handles the closing of popover actions */
    handlePopoverClose = () => {
      this.setState({
        anchorElement: null
      });
    }

    /** Handle user assignment */
    handleAssignUser = (user: User, userNumber: UserNumber) => {
      this.props.assignUser(user, userNumber);
    }

    /** Handle forward user number */
    handleForwardNumber = (user: UserNumber, userNumber: UserNumber) => {
      this.handlePopoverClose();
      this.props.forwardUserNumber(user, userNumber);
    }

    /** Handles the creation and assignment of a new user */
    handleCreateNewUser = () => {
      this.props.toggleNewUserModal();
      this.props.toggleWillAssignNewUser(this.props.userNumber as UserNumber);
      this.handlePopoverClose();
    }

    /** Toggles edit user modal state for modifying user information */
    handleToggleEditUserModal = () => {
      this.props.toggleEditUserModal({
        name: this.props.name,
        phone: this.props.phone,
        id: this.props.id
      });
      this.handlePopoverClose();
    }

    /** Unassigns a User */
    handleUnassignUser = () => {
      this.handlePopoverClose();
      this.props.unassignUser({
        id: this.props.id,
        name: this.props.name,
        physicalNumber: this.props.phone
      });
    }

    /** Returns a list of all unassigned users */
    getUnassignedUsers = (): GetUsersList[] => {
      const { pendingUnassignedUsers, userNumber } = this.props;
      return (pendingUnassignedUsers as User[]).map((user) => ({
        value: user.name || '',
        element: (
          <ListItem
            onClick={() => this.handleAssignUser(user, userNumber as UserNumber)}
            key={user.id}
          >
            <UserInitials
              name={user.name}
              userColor={user.color}
              size={UserInitialsSize.SMALL}
            />
            <p>{user.name}</p>
          </ListItem>
        )
      }));
    }

    /** Returns a list of all user numbers */
    getUserNumbers = (): GetUsersList[] => {
      const {
        allUserNumbers,
        userNumber: currentUserNumber,
        pendingNumberAssignments
      } = this.props;
      return this.getForwardableUserNumbers(allUserNumbers!, currentUserNumber!.systemNumber, pendingNumberAssignments)
        .map((userNumber) => {
          return {
            value: userNumber.systemNumber,
            element: (
              <ListItem
                onClick={() => this.handleForwardNumber(userNumber, currentUserNumber as UserNumber)}
                key={userNumber.id}
              >
                <PhoneType
                  status={userNumber.type}
                  size={PhoneTypeSize.SMALL}
                />
                <p>{userNumber.systemNumber}</p>
              </ListItem>
            )
          };
        });
    }

    /** Gets any forwarded phone numbers */
    getForwardedNumbers = (pendingNumberAssignments: UserNumber[]) =>
      pendingNumberAssignments
        .filter(assignment => assignment.type === UserNumberType.FORWARD && assignment.forward)
        .map(userNumber => userNumber.systemNumber)

    /** Gets all User Numbers that are available for forwarding */
    getForwardableUserNumbers = (
      allUserNumbers: UserNumber[],
      currentSystemNumber: string,
      pendingNumberAssignments: UserNumber[]
    ) => {
      const forwardedNumbers = this.getForwardedNumbers(pendingNumberAssignments);
      return allUserNumbers.filter(item =>
        item.systemNumber !== currentSystemNumber && !forwardedNumbers.includes(item.systemNumber)
      );
    }

    render() {
      const { unassignedUsers, allUserNumbers, userNumber, ...rest } = this.props as WithAssignerProps;
      const { currentView, anchorElement } = this.state;
      const unassignedUsersList = unassignedUsers ? this.getUnassignedUsers() : [];
      const forwardableUserNumbersList = allUserNumbers && userNumber ? this.getUserNumbers() : [];

      return (
        <WrappedComponent
          unassignedUsersList={unassignedUsersList}
          forwardableUserNumbersList={forwardableUserNumbersList}
          onUnassignUserNumber={this.handleUnassignUserNumber}
          onActionViewChange={this.handleActionViewChange}
          onToggleDefaultView={this.handleToggleDefaultView}
          onTogglePopoverActions={this.handleTogglePopoverActions}
          onPopoverClose={this.handlePopoverClose}
          currentView={currentView}
          anchorElement={anchorElement}
          onCreateNewUser={this.handleCreateNewUser}
          onToggleEditUserModal={this.handleToggleEditUserModal}
          onUnassignUser={this.handleUnassignUser}
          {...rest as any}
        />
      );
    }
  }

  const mapStateToProps = (state: GlobalState) => ({
    allUserNumbers: state.userNumbers.allUserNumbers,
    isUnassignedUsersDataLoading: state.users.isUnassignedUsersDataLoading,
    pendingNumberAssignments: state.assignNumbers.pendingNumberAssignments,
    pendingUnassignedUsers: state.assignNumbers.pendingUnassignedUsers,
    unassignedUsers: state.users.unassignedUsers
  });

  const mapDispatchToProps = (dispatch: ThunkDispatcher) => ({
    assignUser: (user: User, userNumber: UserNumber) => dispatch(assignUser(user, userNumber)),
    forwardUserNumber: (forwardingNumber: UserNumber, userNumber: UserNumber) => dispatch(forwardUserNumber(forwardingNumber, userNumber)),
    toggleEditUserModal: (userToEdit: UserToEdit) => dispatch(toggleEditUserModal(userToEdit)),
    toggleNewUserModal: () => dispatch(toggleNewUserModal()),
    toggleWillAssignNewUser: (userNumber: UserNumber) => dispatch(toggleWillAssignNewUser(userNumber)),
    unassignUser: (user: User) => dispatch(unassignUser(user)),
    unassignUserNumber: (userNumberId: number, assignedUserNumber: string) => dispatch(unassignUserNumber(userNumberId, assignedUserNumber))
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(WithAssigner);
};
