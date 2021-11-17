import { formatPhoneNumber } from './phoneParse';

const SYSTEM_MESSAGE_PREFIX = 'SYSTEM MSG: ';

export const getReassignmentNotification = (oldAssigneePhysicalNumber: string) => `${SYSTEM_MESSAGE_PREFIX}This number has been recycled due to inactivity. To continue your conversation with ${formatPhoneNumber(oldAssigneePhysicalNumber)} please click Start Conversation in Salesforce.`;