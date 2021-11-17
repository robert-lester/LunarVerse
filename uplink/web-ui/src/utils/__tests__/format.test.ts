import { formatUserNumber, formatSearchNumber, compareContactNumbers } from '../format';
import { activityMock } from '../mocks';

const phoneNumberFormatted = '(407) 738-7892';
const phoneNumber = '4077387892';

describe('Format utils', () => {
  beforeEach(() => {
    sessionStorage.clear();
  })

  it('should format a phone number into (XXX) XXX-XXXX', () => {
    expect(formatUserNumber(phoneNumber)).toEqual(phoneNumberFormatted);
  });

  it('should strip all special characters and spaces from a phone number', () => {
    expect(formatSearchNumber(phoneNumberFormatted)).toEqual(phoneNumber);
  });

  it('should return true for matched contact numnbers', () => {
    sessionStorage.uplinkContactPhoneNumber = '';
    expect(compareContactNumbers(activityMock)).toEqual(true);
  });

  it('should return false for non-matching contact numnbers', () => {
    sessionStorage.uplinkContactPhoneNumber = '(407) 738-7892';
    expect(compareContactNumbers(activityMock)).toEqual(false);
  });
});