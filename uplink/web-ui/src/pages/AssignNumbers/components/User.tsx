import * as React from 'react';

import {
  Icon,
  IconColor,
  UserInitials,
  IconNames,
  IconSize,
  ListIconColor,
  PopoverActions
} from '../../../components';

import './User.scss';
import { UserNumber } from '../../../apollo/types';
import { formatUserNumber } from '../../../utils';
import { withAssigner, InjectedWithAssignerProps } from './AssignmentHelper';
import { AssignNumbersMessaging } from '../../../constants/messaging';

interface Props {
  color: string;
  id: number;
  isAssigned?: boolean;
  name: string;
  phone: string;
  userNumber: UserNumber;
}

type UserProps = Props & InjectedWithAssignerProps;

export class User extends React.Component<UserProps> {
  /** Gets config for the popover */
  getConfig = () => {
    const { unassignedUsersList, forwardableUserNumbersList } = this.props;
    return {
      defaultView: 'assign',
      views: {
        assign: {
          title: 'Edit Assignment',
          actions: [
            {
              iconName: IconNames.EDIT,
              label: 'Edit User',
              color: ListIconColor.PRIMARY,
              onClick: this.props.onToggleEditUserModal
            },
            {
              iconName: IconNames.REMOVE,
              label: 'Unassign User',
              color: ListIconColor.ERROR,
              onClick: this.props.onUnassignUser
            },
            {
              iconName: IconNames.PHONE_FORWARDED,
              label: 'Forward Number',
              color: ListIconColor.SECONDARY,
              onClick: () => this.props.onActionViewChange('forwardNumber')
            }
          ],
          list: unassignedUsersList,
          emptyListMessage: AssignNumbersMessaging.NO_UNASSIGNED_USERS
        },
        forwardNumber: {
          title: 'Forward Number',
          list: forwardableUserNumbersList,
          emptyListMessage: AssignNumbersMessaging.NO_NUMBERS_TO_FORWARD
        },
      }
    };
  }

  render() {
    const { isAssigned, name, phone, color, anchorElement, currentView } = this.props;
    const open = !!anchorElement;
    const config = this.getConfig();

    return (
      <div className="assign-numbers-user">
        <UserInitials name={name} userColor={color} isAssigned={isAssigned} />
        <div>
          <div className="assign-numbers-user__details">
            <h4>{name}</h4>
          </div>
          <div className="assign-numbers-user__details">
            <div className="assign-numbers-user__data">
              <Icon
                icon={IconNames.PHONE_IPHONE}
                size={IconSize.XSMALL}
                color={IconColor.TWILIGHT}
              />
              <b>{formatUserNumber(phone)}</b>
            </div>
          </div>
        </div>
        <div className="assign-numbers-user__edit-icon">
          <PopoverActions
            config={config}
            currentView={currentView}
            open={open}
            anchorEl={anchorElement}
            onBack={this.props.onToggleDefaultView}
            onClose={this.props.onPopoverClose}
            clickElement={
              <Icon
                icon={IconNames.MORE_VERT}
                size={IconSize.MEDIUM}
                color={IconColor.DARK}
                aria-haspopup="true"
                aria-owns={open ? 'simple-popper' : null}
                onClick={this.props.onTogglePopoverActions}
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default withAssigner(User);
