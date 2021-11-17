import * as React from 'react';

import './BooleanChip.scss';

interface Props {
  className?: string;
  label: string;
  value: BooleanChipValue;
  onClick: (value: any) => void;
  isActive?: boolean;
}

export type BooleanChipValue = string | number;

const BooleanChip = ({ className = '', label, onClick, value, isActive = false }: Props) => (
  <div
    className={`l-boolean-chip ${className} --${isActive ? 'active' : 'inactive'}`}
    onClick={() => onClick(value)}
  >
    {label}
  </div>
);

export default BooleanChip;
