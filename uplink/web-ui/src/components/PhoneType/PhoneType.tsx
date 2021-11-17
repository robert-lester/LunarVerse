import * as React from 'react';

import { Icon, IconSize, IconNames, IconColor } from '../';
import './PhoneType.scss';
import { UserNumberType } from '../../apollo/types';

export enum PhoneTypeSize {
  REGULAR = 'regular',
  SMALL = 'small'
}

export enum PhoneTypeStatus {
  USER = 'user',
  CONTACT = 'contact',
  FORWARD = 'forward',
  UNASSIGNED = 'unassigned',
  RECYCLED = 'recycled'
}

interface Props {
  className?: string;
  selectable?: boolean;
  selected?: boolean;
  size: PhoneTypeSize;
  status?: UserNumberType;
}

interface State {
  isHovered: boolean;
}

export default class PhoneType extends React.PureComponent<Props, State> {
  static defaultProps = {
    className: '',
    selected: false,
    selectable: false,
    size: PhoneTypeSize.REGULAR,
    status: UserNumberType.UNASSIGNED
  };

  state = {
    isHovered: false,
  };

  /** Toggles the selection icon */
  toggleSelect = () => {
    this.setState({ isHovered: !this.state.isHovered });
  }

  /** Determines Icon name based on status */
  getIcon = () => {
    if (this.props.status === UserNumberType.FORWARD) {
      return IconNames.PHONE_FORWARDED;
    } else if (this.props.status === UserNumberType.CONTACT) {
      return IconNames.PHONE_IPHONE;
    } else if (this.props.status === UserNumberType.RECYCLED) {
      return IconNames.AUTO_RENEW;
    }
    return IconNames.PHONE;
  }

  /** Determines Icon size based on the prop of size */
  getIconSize = () => {
    return this.props.size === PhoneTypeSize.REGULAR ? IconSize.SMALL : IconSize.XSMALL;
  }

  /** Renders based on state or props */
  renderData = () => {
    if (this.props.selected) {
      return <Icon icon={IconNames.CHECK_CIRCLE} color={IconColor.LIGHT} />;
    } else if (this.state.isHovered) {
      return <Icon icon={IconNames.RADIO_BUTTON_UNCHECKED} color={IconColor.LIGHT} />;
    }
    return <Icon icon={this.getIcon()} size={this.getIconSize()} />;
  }

  /** Renders the Contact icon */
  renderIcon = () => {
    if (this.props.selectable) {
      return this.renderData();
    } else {
      return <Icon icon={this.getIcon()} size={this.getIconSize()} />;
    }
  }

  render() {
    return (
      <div
        className={`l-phone-type ${this.props.className} --${this.props.size} --${PhoneTypeStatus[this.props.status as UserNumberType]}`}
        onMouseEnter={this.toggleSelect}
        onMouseLeave={this.toggleSelect}
      >
        {this.renderIcon()}
      </div>
    );
  }
}