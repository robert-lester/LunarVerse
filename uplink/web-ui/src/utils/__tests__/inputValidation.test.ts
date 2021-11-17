import { IconNames } from '../../components';
import { ValidationStatus } from '../../pages/Landing/components/PasswordValidation';
import { getValidationIcon, testNumberCount, testCapitalLetterCount, testCharacterCount } from '../inputValidation';

describe('Input validation utils', () => {
  it(`should return ${IconNames.CHECK_CIRCLE}`, () => {
    expect(getValidationIcon(ValidationStatus.PASS)).toEqual(IconNames.CHECK_CIRCLE);
  });

  it('should return true for existance of an 8 character minimum', () => {
    expect(testCharacterCount('Testing!')).toEqual(true);
  });

  it('should return true for existance of a capital letter', () => {
    expect(testCapitalLetterCount('A')).toEqual(true);
  });

  it('should return true for existance of a number', () => {
    expect(testNumberCount('1')).toEqual(true);
  });
});