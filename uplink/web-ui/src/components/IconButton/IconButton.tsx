import * as React from 'react';

import './IconButton.scss';

export enum IconButtonType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  GHOST = 'ghost',
  NORMAL = 'normal',
  ACTION = 'action'
}

interface Props {
  Icon: JSX.Element;
  className?: string;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  onDark?: boolean;
  type?: IconButtonType;
}

export default class IconButton extends React.PureComponent<Props> {
  render() {
    const { disabled = false, onClick, className = '', label, Icon, onDark = false, type = IconButtonType.NORMAL } = this.props;
    return (
      <div
        className={`l-icon-button ${disabled ? '--disabled' : ''} ${className}`}
        onClick={onClick}
      >
        <div className={`__label ${onDark ? '--light' : ''}`}>{label}</div>
        <div className={`__container --${type}`}>
          {Icon}
        </div>
      </div>
    );
  }
}
