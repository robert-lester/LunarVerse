import { getForwardedNumbers, getForwardableUserNumbers, updateUserNumberWithAssignedUser } from '../assignments';
import { UserNumber, UserNumberType, UserType } from '../../apollo/types';

const user = {
  color: '',
  directDialNumber: '',
  id: 2,
  name: '',
  phoneNumber: null,
  physicalNumber: '',
  systemNumber: '',
  type: UserNumberType.USER
};

const userNumber = {
  forward: null,
  id: 1,
  messages: [],
  systemNumber: '(407) 123-1234',
  type: UserNumberType.FORWARD,
  user,
  callOrText30Days: false
};

const userNumbers: UserNumber[] = [
  userNumber
];

const userNumbersForwarded: UserNumber[] = [
  {
    ...userNumbers[0],
    forward: userNumbers[0]
  }
];

describe('Assignments utils', () => {
  it('should get empty list of user numbers that are forwarded', () => {
    expect(getForwardedNumbers(userNumbers)).toEqual([]);
  });

  it('should get list of user numbers that are forwarded', () => {
    expect(getForwardedNumbers(userNumbersForwarded)).toEqual(['(407) 123-1234']);
  });

  it('should get a list of user numbers that can be forwarded', () => {
    expect(getForwardableUserNumbers(userNumbers, '', userNumbers)).toEqual(userNumbers);
  });

  it('should return a user number with an updated user', () => {
    expect(updateUserNumberWithAssignedUser(userNumber, userNumber, user)).toEqual({ ...userNumber, type: UserType.USER });
  });

  it('should return a user number without an updated user', () => {
    expect(updateUserNumberWithAssignedUser(userNumber, { ...userNumber, id: 2 }, user)).toEqual(userNumber);
  });
});