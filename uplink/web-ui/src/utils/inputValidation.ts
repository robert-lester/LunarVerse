import { ValidationStatus } from "../pages/Landing/components/PasswordValidation";
import { IconNames } from "../components";

/** Gets the validation icon */
export const getValidationIcon = (status: ValidationStatus) => {
  const validationIconMapping = {
    [ValidationStatus.PASS]: IconNames.CHECK_CIRCLE,
    [ValidationStatus.FAIL]: IconNames.CANCEL,
    [ValidationStatus.INCOMPLETE]: IconNames.REMOVE_CIRCLE
  }
  return validationIconMapping[status];
}

/** Tests for 8 character min count */
export const testCharacterCount = (value: string) => {
  return (/\S{8,}$/g).test(value);
}

/** Tests for 1 capital letter */
export const testCapitalLetterCount = (value: string) => {
  return (/[A-Z]/g).test(value);
}

/** Tests for 1 number */
export const testNumberCount = (value: string) => {
  return (/\d/g).test(value);
}