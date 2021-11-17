import { isUSCountryCode, isCACountryCode } from '../lib/phoneParse';

export default abstract class IntakeUtils {
  /**
   * Is the phone number accepted by uplink intake?
   *
   * @static
   * @memberof IntakeUtils
   * @param phoneNumber A string representing a phone number
   * @returns boolean
   */
  static readonly isValidUplinkCountryCode = (phoneNumber: string): boolean => {
    if (!isUSCountryCode(phoneNumber) && !isCACountryCode(phoneNumber)) {
      console.error(`INTERNATIONAL NUMBER: Phone number ${phoneNumber} is not a US or CA country code!`);
      return false;
    }
    return true;
  }
}