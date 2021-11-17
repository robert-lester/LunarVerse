import * as React from 'react';

import { Icon, IconNames } from '../';
import { getUserColor } from '../../utils';

import './UserInitials.scss';
import { IconColor } from '../Icon/Icon';

export enum UserInitialsSize {
  REGULAR = 'regular',
  SMALL = 'small'
}

interface Props {
  name: string;
  isAssigned?: boolean;
  userColor: string;
  size: UserInitialsSize;
  className?: string;
  selected?: boolean;
  selectable?: boolean;
}

interface State {
  isHovered: boolean;
}

const initialState = { isHovered: false };

export default class UserInitials extends React.PureComponent<Props, State> {
  static defaultProps = {
    userColor: 'grey',
    className: '',
    selected: false,
    selectable: false,
    size: UserInitialsSize.REGULAR,
    isAssigned: false
  };

  state: State = initialState;

  /** Gets user initials */
  getInitials = () => {
    const nameSplit = this.props.name ? this.props.name.split(' ') : '';
    return nameSplit ? nameSplit[0][0] + (nameSplit[1] ? nameSplit[1][0] : '') : '';
  }

  /** Toggles the selection icon */
  toggleSelect = () => {
    this.setState({ isHovered: !this.state.isHovered });
  }

  /** Renders based on state or props */
  renderData = () => {
    if (this.props.selected) {
      return <Icon icon={IconNames.CHECK_CIRCLE} color={IconColor.LIGHT} />;
    } else if (this.state.isHovered) {
      return <Icon icon={IconNames.RADIO_BUTTON_UNCHECKED} color={IconColor.LIGHT} />;
    }
    return this.getInitials();
  }

  userInitialsStyle = () => {
    const userColor = getUserColor(this.props.userColor);
    if (this.props.size === UserInitialsSize.REGULAR && this.props.isAssigned === true) {
      return {
        backgroundColor: userColor
      };
    }
    return {
      color: userColor,
      border: `1px solid ${userColor}`
    };
  }

  render() {
    return (
      <div
        className={`l-user-initials ${this.props.className} --${this.props.size}`}
        onMouseEnter={this.toggleSelect}
        onMouseLeave={this.toggleSelect}
        style={this.userInitialsStyle()}
      >
        {this.props.selectable ? this.renderData() : this.getInitials()}
      </div>
    );
  }
}
