import * as React from 'react';

import './Input.scss';
import { Label } from '../';
import { ValidationStatus } from '../../pages/Landing/components/PasswordValidation';
import { Icon, IconSize, IconColor } from '../Icon/Icon';
import { Tooltip } from '@material-ui/core';
import { getValidationIcon } from '../../utils/inputValidation';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  errorMessage?: string;
  validation?: {
    status: ValidationStatus;
    message: string;
  }
}

export default class Input extends React.PureComponent<Props> {
  render() {
    const {
      label,
      className,
      errorMessage,
      validation,
      ...props
    } = this.props;
    return (
      <div className="l-input">
        {label && <Label label={label} />}
        <div className="__container">
          <input
            className={`__element ${className}`}
            {...props}
          />
          {validation &&
            <div className="__validation">
              <Tooltip title={validation.message} placement="bottom">
                <Icon
                  icon={getValidationIcon(validation.status)}
                  size={IconSize.MEDIUM}
                  color={IconColor.DARK}
                  className={`--${validation.status}`}
                />
              </Tooltip>
            </div>
          }
          {errorMessage &&
            <div className="__extraneous">
              <p className="__error">
                {errorMessage}
              </p>
            </div>
          }
        </div>
      </div>
    );
  }
}
