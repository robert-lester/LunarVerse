import * as React from 'react';

import './Card.scss';
interface Props {
  className?: string;
  children: React.ReactNode;
}
const Card = ({ children, className = '' }: Props) => (
  <div className={`l-card ${className}`}>
    {children}
  </div>
);

export default Card;
