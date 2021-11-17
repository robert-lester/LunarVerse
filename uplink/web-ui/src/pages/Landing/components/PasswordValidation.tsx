import * as React from 'react';

import './PasswordValidation.scss';
import { Icon, IconSize } from '../../../components';
import { getValidationIcon, testNumberCount, testCapitalLetterCount, testCharacterCount } from '../../../utils/inputValidation';

export enum ValidationStatus {
  PASS = 'pass',
  FAIL = 'fail',
  INCOMPLETE = 'incomplete'
}

interface Props {
  value: string;
}

export class PasswordValidation extends React.PureComponent<Props> {
  /** Translates the true or false of the regex test to a ValidationStatus */
  getStatus(isPassing: boolean): ValidationStatus {
    return isPassing ? ValidationStatus.PASS : ValidationStatus.FAIL;
  }
  render () {
    let characterCountStatus = ValidationStatus.INCOMPLETE
    let capitalLetterStatus = ValidationStatus.INCOMPLETE;
    let numberStatus = ValidationStatus.INCOMPLETE;

    if (this.props.value) {
      characterCountStatus = this.getStatus(testCharacterCount(this.props.value));
      capitalLetterStatus = this.getStatus(testCapitalLetterCount(this.props.value));
      numberStatus = this.getStatus(testNumberCount(this.props.value));
    }
    return (
      <div className="password-validation">
        <div className="__validation-row">
          <Icon size={IconSize.XSMALL} icon={getValidationIcon(characterCountStatus)} className={`--${characterCountStatus}`}/> 8 or more characters
        </div>
        <div className="__validation-row">
          <Icon size={IconSize.XSMALL} icon={getValidationIcon(capitalLetterStatus)} className={`--${capitalLetterStatus}`}/> 1 capital letter
        </div>
        <div className="__validation-row">
          <Icon size={IconSize.XSMALL} icon={getValidationIcon(numberStatus)} className={`--${numberStatus}`}/> 1 number
        </div>
      </div>
    )
  }
}