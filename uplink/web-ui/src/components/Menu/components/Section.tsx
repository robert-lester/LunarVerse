import * as React from 'react';

import './Section.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export const Section = ({ children, className = '' }: Props) => (
  <div className={`l-menu-section ${className}`}>
    {children}
  </div>
);
