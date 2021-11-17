import * as React from 'react';

import {
  Icon,
  IconSize,
  IconNames,
  IconColor,
  PopoverActions,
  ListIconColor,
  PhoneType,
  PhoneTypeSize
} from '../../../components';

import './Phone.scss';
import { UserNumberType, UserNumber } from '../../../apollo/types';
import { withAssigner, InjectedWithAssignerProps } from './AssignmentHelper';
import { AssignNumbersMessaging } from '../../../constants/messaging';

interface Props {
  id?: number | null;
  phoneNumber: string;
  status?: UserNumberType;
  className?: string;
  hasActions?: boolean;
  userNumber?: UserNumber;
}

type PhoneProps =  Props & InjectedWithAssignerProps;

export class Phone extends React.Component<PhoneProps> {
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
              iconName: IconNames.REMOVE,
              label: 'Unassign Number',
              color: ListIconColor.ERROR,
              onClick: this.props.onUnassignUserNumber
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
    const {
      status = UserNumberType.UNASSIGNED,
      className = ''
    } = this.props;
    const open = !!this.props.anchorElement;
    const config = this.getConfig();

    return (
      <div className={`assign-numbers-phone ${className}`}>
        <PhoneType status={status} size={PhoneTypeSize.REGULAR} />
        <b>{this.props.phoneNumber}</b>
        {this.props.hasActions &&
          <div className="assign-numbers-phone__edit-icon">
            <PopoverActions
              config={config}
              currentView={this.props.currentView}
              open={open}
              anchorEl={this.props.anchorElement}
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
                />}
            />
          </div>
        }
      </div>
    );
  }
}

export default withAssigner(Phone);
