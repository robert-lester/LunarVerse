import * as React from 'react';

import { PopoverActions, IconNames, ListIconColor, IconSize, IconColor, Icon } from '../../../components';
import { withAssigner, InjectedWithAssignerProps,  } from './AssignmentHelper';

export class EmptyAssignment extends React.Component<InjectedWithAssignerProps> {
  /** Gets empty assignment configuration */
  getConfig = () => {
    const { unassignedUsersList, forwardableUserNumbersList } = this.props;
    return {
      defaultView: 'assign',
      views: {
        assign: {
          title: 'Edit Assignment',
          actions: [
            {
              iconName: IconNames.PERSON_ADD,
              label: 'Create & Assign New User',
              color: ListIconColor.PRIMARY,
              onClick: this.props.onCreateNewUser
            },
            {
              iconName: IconNames.PHONE_FORWARDED,
              label: 'Forward Number',
              color: ListIconColor.SECONDARY,
              onClick: () => this.props.onActionViewChange('forwardNumber')
            }
          ],
          list: unassignedUsersList,
          emptyListMessage: 'There are no unassigned users.'
        },
        forwardNumber: {
          title: 'Forward Number',
          list: forwardableUserNumbersList,
          emptyListMessage: 'There are no numbers to forward.'
        },
      }
    };
  }

  render() {
    const open = !!this.props.anchorElement;
    const config = this.getConfig();
    return (
      <PopoverActions
        config={config}
        currentView={this.props.currentView}
        open={open}
        anchorEl={this.props.anchorElement}
        onBack={this.props.onToggleDefaultView}
        onClose={this.props.onPopoverClose}
        clickElement={
          <div className="assign-numbers-assignment__empty-connection" onClick={this.props.onTogglePopoverActions}>
            <Icon
              icon={IconNames.ADD}
              color={IconColor.TWILIGHT}
              size={IconSize.SMALL}
              aria-haspopup="true"
              aria-owns={open ? 'simple-popper' : undefined}
            />
          </div>}
      />
    );
  }
}

export default withAssigner(EmptyAssignment);