import * as React from 'react';

import './Spinner.scss';

export enum SpinnerSize {
  SMALL = 'small',
  LARGE = 'large'
}

interface Props {
  size?: SpinnerSize;
  className?: string;
  color1?: string;
  color2?: string;
}
const Spinner = ({
  size = SpinnerSize.LARGE,
  color1 = '#0049a0',
  color2 = 'rgba(0, 0, 0, .2)',
  className = ''
}: Props) => (
    <div className={`l-spinner --${size} ${className}`} style={{ borderColor: color2, borderLeftColor: color1 }} />
  );

export default Spinner;
