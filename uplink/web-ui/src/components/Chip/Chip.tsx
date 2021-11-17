import * as React from 'react';

import './Chip.scss';
import { Icon, IconNames } from '../';
import { IconSize } from '../Icon/Icon';

interface Props {
  className?: string;
  label: string;
  onDelete?: () => void;
  canDelete?: boolean;
  isDisabled?: boolean;
  iconName?: IconNames;
}

// TODO: Maybe this component is doing too much?
const Chip = ({ className = '', label, onDelete, canDelete = false, isDisabled = true, iconName}: Props) => (
  <div className={`l-chip ${className} --${isDisabled ? 'disabled' : 'enabled'} --${canDelete ? 'can-delete' : 'cannot-delete'}`}>
    {iconName &&
      <Icon
        icon={iconName}
        size={IconSize.XSMALL}
        className="__icon"
      />
    }
    {label}
    {canDelete &&
      <Icon
        className="__delete"
        icon={IconNames.CANCEL}
        onClick={onDelete}
      />
    }
  </div>
);

export default Chip;
