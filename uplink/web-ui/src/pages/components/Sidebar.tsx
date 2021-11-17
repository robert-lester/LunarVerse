import * as React from 'react';

import './Sidebar.scss';
interface Props {
  children: React.ReactNode;
}

export const Sidebar = ({ children }: Props) => (
  <aside className="sidebar">
    {children}
  </aside>
);
