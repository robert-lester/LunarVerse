import * as React from 'react';

import './ModalActions.scss';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const ModalActions = ({ children, className }: Props) => (
  <div className={`l-modal__actions ${className}`}>
    {children}
  </div>
);