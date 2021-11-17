import * as React from 'react';

import Spinner, { SpinnerSize } from '../../img/Spinner';
import './Button.scss';

export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DANGER = 'danger'
}

export enum ButtonVariant {
  TEXT_ONLY = 'text-only',
  OUTLINE = 'outline'
}

interface Props {
  className?: string;
  Icon?: JSX.Element;
  isLoading?: boolean;
  label: string;
  onClick?: (argument?: any) => void;
  appearance?: ButtonType;
  variant?: ButtonVariant;
}

export default class Button extends React.Component<Props & React.ButtonHTMLAttributes<HTMLElement>> {

  render() {
    const {
      label,
      className = '',
      Icon,
      isLoading,
      appearance = ButtonType.PRIMARY,
      variant,
      ...rest
    } = this.props;
    return (
      <button
        className={`l-button ${className} --${appearance} --${variant}`}
        onClick={this.props.onClick}
        {...rest}
      >
        {Icon && <div className="__icon">{Icon}</div>}
        <span className="__label">{label}</span>
        {isLoading && <Spinner size={SpinnerSize.SMALL} className="__loading" color1="rgba(255, 255, 255, .9)" color2="rgba(255, 255, 255, .4)"/>}
      </button>
    );
  }
}
