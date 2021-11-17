import * as React from 'react';

import './Layout.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}
export const Layout = ({ className = '', children }: Props) => (
  <div className={`layout ${className}`}>
    {children}
  </div>
);
