import { UserNumber, UserNumberType, User } from '../apollo/types';

/** Gets any forwarded phone numbers */
export const getForwardedNumbers = (pendingNumberAssignments: UserNumber[]) =>
  pendingNumberAssignments
    .filter(assignment => assignment.type === UserNumberType.FORWARD && assignment.forward)
    .map(userNumber => userNumber.forward!.systemNumber);

/** Gets all User Numbers that are available for forwarding */
export const getForwardableUserNumbers = (
  allUserNumbers: UserNumber[],
  currentSystemNumber: string,
  pendingNumberAssignments: UserNumber[]
) => {
  const forwardedNumbers = getForwardedNumbers(pendingNumberAssignments);
  return allUserNumbers.filter(item =>
    item.systemNumber !== currentSystemNumber && !forwardedNumbers.includes(item.systemNumber)
  );
};

/** Determines whether or not the existingUserNumber is the userNumber to be updated
 *  If it should be updated, it sets the user to this user number and removes the forward
 */
export const updateUserNumberWithAssignedUser = (existingUserNumber: UserNumber, userNumber: UserNumber, user: User) => {
  if (existingUserNumber.id === userNumber.id) {
    return {
      ...existingUserNumber,
      type: UserNumberType.USER,
      user,
      forward: null
    };
  }
  return existingUserNumber;
};
