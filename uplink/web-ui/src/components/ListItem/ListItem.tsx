import * as React from 'react';

import './ListItem.scss';

export interface ListItemType {
  value: string;
  element: React.ReactNode;
}

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
}
export const ListItem = ({ children, ...rest }: Props) => (
  <div {...rest} className="l-list-item">
    {children}
  </div>
);
