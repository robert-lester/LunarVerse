import * as React from 'react';

import './Header.scss';

interface Props {
  children: React.ReactNode;
}

export const Header = ({ children }: Props) => (
  <header className="header">
    {children}
  </header>
);
