import * as React from 'react';

import './Radio.scss';
import { Icon, IconNames, IconColor } from '../Icon/Icon';

interface Props {
  className?: string;
  checked: boolean;
  label: string;
  onClick?: (argument?: any) => void;
  variant?: RadioVariant;
}

export enum RadioVariant {
  ON_LIGHT = 'on-light',
  ON_DARK = 'on-dark'
}

export default class Radio extends React.Component<Props & React.InputHTMLAttributes<HTMLElement>> {
  render() {
    const {
      label,
      className = '',
      checked,
      variant = RadioVariant.ON_LIGHT,
      ...rest
    } = this.props;
    const color = variant === RadioVariant.ON_DARK ? IconColor.LIGHT : IconColor.DARK;
    return (
      <div className="l-radio">
        <input type="radio" className={`__input ${className} --${variant}`} checked={checked} {...rest} />
        {checked
          ? <Icon icon={IconNames.RADIO_BUTTON_CHECKED} color={color}/>
          : <Icon icon={IconNames.RADIO_BUTTON_UNCHECKED} color={color}/>
        }
        {label}
      </div>
    );
  }
}
