import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

export const ModalContent = ({ children }: Props) => (
  <div className="l-modal__content">
    {children}
  </div>
);