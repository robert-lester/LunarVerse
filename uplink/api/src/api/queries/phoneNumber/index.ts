import getPhoneNumbers from './rootPhoneNumbers';
import conversations from './conversation';
import messages from './message';
import user from './user';
import forward from './forward';

export default {
  Query: {
    getPhoneNumbers,
  },
  PhoneNumber: {
    forward,
    conversations,
    messages,
    user,
  },
};
