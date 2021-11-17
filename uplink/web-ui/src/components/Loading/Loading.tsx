import * as React from 'react';

import Spinner, { SpinnerSize } from '../../img/Spinner';
import './Loading.scss';

interface Props {
  isGlobal?: boolean;
  size?: SpinnerSize;
  className?: string;
}

export const Loading = ({ isGlobal = false, size = SpinnerSize.LARGE, className = '' }: Props) => {
  const classes = `l-loading l-loading--${isGlobal ? 'global' : 'non-global'} ${className}`;
  return (
    <div className={classes}>
      {Spinner({ size })}
    </div>
  );
};
