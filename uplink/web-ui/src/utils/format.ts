import { Activity } from '../apollo/types';

/** Formats a phone number to include dashes (US). */
export const formatUserNumber = (phoneNumber: string) => {
  phoneNumber = phoneNumber.replace(/[^\d]/g, '');
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

/** Formats a string to only include numbers. */
export const formatSearchNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/[^0-9]/g, '');
};

/** Compares the session storage number with the returned number */
export const compareContactNumbers = (activityData: Activity | null): boolean => {
  if (formatSearchNumber(activityData!.systemNumber) === formatSearchNumber(sessionStorage.getItem('uplinkContactPhoneNumber') as string)) {
    return true;
  }
  return false;
};