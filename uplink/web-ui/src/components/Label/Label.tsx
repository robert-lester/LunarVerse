import * as React from 'react';

import './Label.scss';

interface Props {
  label: string;
}

export const Label = ({ label }: Props) => {
  return (
    <label className="l-label">{label}</label>
  );
};
