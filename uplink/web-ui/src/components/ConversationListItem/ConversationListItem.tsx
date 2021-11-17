import * as React from 'react';
import moment from 'moment';

import './ConversationListItem.scss';
import IconLogo from '../../img/IconLogo';
import { ContactNumberType } from '../../reducers';
import { Icon, IconNames, IconSize, IconColor } from '../Icon/Icon';
import { PhoneTypeSize } from '../PhoneType/PhoneType';
import { UserInitials, PhoneType } from '..';
import { UserNumber, UserNumberType } from '../../apollo/types';

interface Props {
  contactDisplay: ContactNumberType;
  contactNumber?: UserNumber;
  isContactVisible: boolean
  isSelected: boolean;
  onClick: () => void;
  updatedAt: string;
  userNumber?: UserNumber;
}

class ConversationListItem extends React.PureComponent<Props> {
  /** Renders the Uplink or Real number icons based on contact visibility */
  renderContactNumberIcon = () => {
    const { contactNumber } = this.props;
    // Where contact number is recycled
    if (!contactNumber) {
      return <Icon icon={IconNames.AUTO_RENEW} size={IconSize.SMALL} color={IconColor.DARK} />;
    }
    if (this.props.isContactVisible) {
      if (this.props.contactDisplay === ContactNumberType.REAL) {
        return <Icon icon={IconNames.PHONE_IPHONE} size={IconSize.SMALL} color={IconColor.DARK} />;
      } else {
        return (
          <div className="__contact-uplink">
            {IconLogo()}
          </div>
        );
      }
    }
    return null;
  }

  /** Renders the User Number or Contact Number data based on context */
  renderContextData = () => {
    const { contactNumber, userNumber } = this.props;
    // Show User Number data (SF)
    if (userNumber && !this.props.isContactVisible) {
      return (
        <div className="__name-number">
          <p>{userNumber.user ? userNumber.user.name : '-'}</p>
          <b>{userNumber.systemNumber}</b>
        </div>
      );
    } else {
      // Show Contact number
      const { contactDisplay } = this.props;
      let phoneNumber = '';
      if (contactNumber) {
        if (contactDisplay === ContactNumberType.REAL && contactNumber.user) {
          phoneNumber = contactNumber.user.physicalNumber;
        } else if (contactDisplay === ContactNumberType.UPLINK) {
          phoneNumber = contactNumber.systemNumber;
        }
      } else {
        // Where contact number is no longer associated
        phoneNumber = 'Recycled';
      }
      return (
        <b className="__margin-left">
          {phoneNumber}
        </b>
      );
    }
  }

  /** Renders the User Number icon */
  renderUserNumberIcon = () => {
    const { userNumber } = this.props;
    if (userNumber) {
      // User icon
      if (userNumber.type === UserNumberType.USER) {
        return (
          <UserInitials name={userNumber.user.name} userColor={userNumber.user.color} isAssigned={true} />
        )
      }
      return (
        <PhoneType
          size={PhoneTypeSize.REGULAR}
          status={userNumber.type}
        />
      )
    }
  }

  render() {
    const { isSelected, onClick, updatedAt, isContactVisible } = this.props;
    return (
      <div
        className={`l-conversation-list-item ${isSelected ? '--selected' : ''}`}
        onClick={onClick}
      >
        <div className="__users">
          {this.renderUserNumberIcon()}
          {isContactVisible ? <Icon icon={IconNames.SWAP_HORIZONTAL} /> : null}
          <div className="__margin-left">
            <div className="__data">
              {this.renderContactNumberIcon()}
              {this.renderContextData()}
            </div>
          </div>
        </div>
        <time>
          <h6>{moment(updatedAt).format('MM/DD/YY')}</h6>
        </time>
      </div>
    );
  }
}

export default ConversationListItem;