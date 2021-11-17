import getConversation from './rootConversation';
import getConversations from './rootConversations';
import messages from './messages';
import phoneNumbers from './phoneNumbers';

export default {
  Query: {
    getConversation,
    getConversations,
  },
  Conversation: {
    messages,
    phoneNumbers,
  },
};
