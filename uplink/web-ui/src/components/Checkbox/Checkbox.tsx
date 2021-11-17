import * as React from 'react';

import './Checkbox.scss';
import { Icon, IconNames } from '../';

interface Props {
  onToggle: () => void;
  isChecked: boolean;
  label: string;
}

const Checkbox = ({
  isChecked, onToggle, label,
}: Props) => {

  return (
    <div onClick={onToggle}>
      <Icon
        className={`l-checkbox__icon ${isChecked && 'l-checkbox__icon--checked'}`}
        icon={isChecked ? IconNames.CHECKBOX : IconNames.CHECKBOX_OUTLINE_BLANK}
      />
      <div className="l-checkbox">
        <div className="l-checkbox__label">{label}</div>
      </div>
    </div>
  );
};

export default Checkbox;
