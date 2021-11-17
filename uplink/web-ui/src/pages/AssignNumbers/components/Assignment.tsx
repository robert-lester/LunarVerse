import * as React from 'react';

import { Phone, User, EmptyAssignment } from './';
import { UserNumber, UserNumberType } from '../../../apollo/types';
import './Assignment.scss';
import { Tooltip } from '@material-ui/core';
import { Icon, IconNames, IconSize, IconColor } from '../../../components';

interface Props {
  userNumber: UserNumber;
  zIndex: number;
}

export class Assignment extends React.Component<Props> {

  /** Renders empty, forwarded number, or user */
  renderAssignment = () => {
    const { userNumber: { user, forward, type } } = this.props;
    // If User Number is type USER
    if (type === UserNumberType.USER) {
      return (
        <User
          id={user ? user.id : 0}
          name={user ? user.name : ''}
          phone={user ? user.physicalNumber : ''}
          color={user ? user.color : ''}
          userNumber={this.props.userNumber}
          isAssigned={true}
        />
      );
    } else if (type === UserNumberType.UNASSIGNED) {
      return (
        <EmptyAssignment userNumber={this.props.userNumber}/>
      );
    }
    return (
      <Phone
        id={forward && forward.id}
        phoneNumber={forward ? forward.systemNumber : ''}
        status={forward ? forward.type : UserNumberType.FORWARD}
        className="assign-numbers-assignment__forwarded-number"
        hasActions={true}
        userNumber={this.props.userNumber}
      />
    );
  }

  render() {
    const { userNumber: { systemNumber, type }} = this.props;
    return (
      <div className="assign-numbers-assignment">
        <div className="assign-numbers-assignment__row">
          <Phone
            phoneNumber={systemNumber as string}
            status={type}
          />
          {this.props.userNumber.callOrText30Days &&
            <div className="assign-numbers-assignment__active-number">
              <Tooltip title="This number has been active within the last 30 days." placement="bottom">
                <Icon
                  icon={IconNames.PRIORITY_HIGH}
                  size={IconSize.SMALL}
                  color={IconColor.LIGHT}
                  className="assign-numbers-assignment__active-number-icon"
                />
              </Tooltip>
            </div>
          }
          {this.renderAssignment()}
        </div>
      </div>
    );
  }
}

export default Assignment;
