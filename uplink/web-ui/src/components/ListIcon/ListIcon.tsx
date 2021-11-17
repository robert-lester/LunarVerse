import * as React from 'react';

import { Icon, IconColor, IconNames, IconSize } from '../../components';
import './ListIcon.scss';

export enum ListIconColor {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  ERROR = 'error'
}

export interface ListIconProps {
  color?: ListIconColor;
  iconName: IconNames;
  label: string;
  onClick: (args?: any) => void;
}

export const ListIcon = ({
  color = ListIconColor.PRIMARY,
  iconName,
  label,
  onClick
}: ListIconProps) => {
  const classes = `l-list-icon__icon --${color}`;
  return (
    <div className="l-list-icon" onClick={onClick}>
      <div className={classes}>
        <Icon icon={iconName} color={IconColor.LIGHT} size={IconSize.XSMALL} />
      </div>
      <p className="l-list-icon__label">{label}</p>
    </div>
  );
};