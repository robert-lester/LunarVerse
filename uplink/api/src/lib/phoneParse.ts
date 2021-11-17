import {
  parseNumber,
  CountryCode,
  formatNumber,
  isValidNumber,
  NationalNumber
} from 'libphonenumber-js';

/**
 * Parses phone number to standardize formats
 * @param number Phone number to be parsed
 * @return parsed phone number string
 */
export const parsePhoneNumber = (number: string): string => {
  const parsedNum = parseNumber(number, 'US');

  if (!parsedNum.phone || !validatePhoneNumber(parsedNum.phone.toString())) {
    return null;
  }
  return `+1${parsedNum.phone}`;
};

/**
 * Formats phone number to match salesforce phone number format
 * @param number Phone number to be formatted
 * @return Formatted phone number string
 */
export const formatPhoneNumber = (number: string): NationalNumber =>
  formatNumber(number, 'US', 'National');

/**
 * Determines whether the given phone number represents a particular country code
 *
 * https://wikitravel.org/en/List_of_country_calling_codes
 *
 * @param number Phone number to be parsed
 * @param hasCountryCode An ISO country code
 * @see https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 * @return boolean
 */
export const isCountryCode = (phoneNumber: string, hasCountryCode: CountryCode): boolean => {
  const parsedNum = parseNumber(phoneNumber, hasCountryCode);

  // Returns { country, phone, ext } object where country is a country code,
  // phone is a national (significant) number, ext is a phone number extension.
  if (!parsedNum || !parsedNum.phone || !parsedNum.country) {
    // The country code. Example: "US". Will be undefined when no country
    // could be derived from the phone number. For example, when several
    // countries have the same countryCallingCode and the nationalNumber
    // doesn't look like it belongs to any of them.
    return false;
  }

  return (parsedNum.country === hasCountryCode);
};

/**
 * Determines whether the given phone number represents a 'US' country code
 *
 * United States, Canada, and several Caribbean nations share the
 * international calling code 1, with each US state (or parts of US states),
 * province, territory, or island nation given its own three-digit "area code".
 *
 * https://wikitravel.org/en/List_of_country_calling_codes
 *
 * @param number Phone number to be parsed
 * @return boolean
 */
export const isUSCountryCode = (phoneNumber: string): boolean => {
  return isCountryCode(phoneNumber, 'US');
};

/**
 * Determines whether the given phone number represents a 'CA' country code
 *
 * United States, Canada, and several Caribbean nations share the
 * international calling code 1, with each US state (or parts of US states),
 * province, territory, or island nation given its own three-digit "area code".
 *
 * https://wikitravel.org/en/List_of_country_calling_codes
 *
 * @param number Phone number to be parsed
 * @return boolean
 */
export const isCACountryCode = (phoneNumber: string): boolean => {
  return isCountryCode(phoneNumber, 'CA');
};

/**
 * Determines whether the given phone number is a valid phone number
 * in the United States or Canada
 * @param number Phone number to be validated
 * @return boolean
 */
export const validatePhoneNumber = (number: string): boolean => isValidNumber(number, 'US') || isValidNumber(number, 'CA');
