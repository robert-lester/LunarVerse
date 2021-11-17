import * as React from 'react';

import { Icon, IconSize, IconNames, IconColor } from '../';
import './UnassignedPhone.scss';

const PHONE_ICON = (
  <Icon
    icon={IconNames.PHONE}
    color={IconColor.LIGHT}
    size={IconSize.SMALL}
  />
);

interface Props {
  selected: boolean;
  selectable: boolean;
}

export default class UnassignedPhone extends React.PureComponent<Props> {
  state = {
    isHovered: false
  };

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
    return PHONE_ICON;
  }

  render() {
    return (
      <div
        className="l-unassigned-phone"
        onMouseEnter={this.toggleSelect}
        onMouseLeave={this.toggleSelect}
      >
        {this.props.selectable ? this.renderData() : PHONE_ICON}
      </div>
    );
  }
}
