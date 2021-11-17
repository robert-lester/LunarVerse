import * as React from 'react';

import './Column.scss';

export enum ColumnWidth {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  FULL = 'full'
}

interface Props {
  width?: ColumnWidth;
  skip?: number;
  children: React.ReactNode;
}

export const Column = ({ children, width = ColumnWidth.MEDIUM, skip = 0 }: Props) => (
  <div className={`l-column l-column--${width} ${skip ? `l-column--skip-${skip}` : ''}`}>
    {children}
  </div>
);