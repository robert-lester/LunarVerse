import * as React from 'react';

import './Content.scss';

interface Props {
  backgroundColor?: string;
  isPushedDown?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Content = ({ children, backgroundColor = '', isPushedDown = true, className = '' }: Props) => (
  <div className={`content --${isPushedDown ? 'pushed' : 'not-pushed'} ${className}`} style={{ backgroundColor }}>
    {children}
  </div>
);
