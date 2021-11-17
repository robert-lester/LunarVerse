import * as React from 'react';

import './Menu.scss';
import { Icon } from '../';
import { IconNames } from '../';
import { IconColor } from '../Icon/Icon';

interface Props {
  icon: IconNames;
  title: string;
  children: React.ReactNode;
}

export const Menu = ({ children, icon, title }: Props) => (
  <div className="l-menu">
    <div className="l-menu__title-bar">
      <Icon
        icon={icon}
        className="l-menu__icon"
        color={IconColor.TWILIGHT}
      />
      <h4 className="l-menu__title">{title}</h4>
    </div>
    <div className="l-menu__content">
      {children}
    </div>
  </div>
);
