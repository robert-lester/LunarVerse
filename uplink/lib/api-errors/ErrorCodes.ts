export enum ClientErrors {
  // StartConversation Errors
  INVALID_CONTACT_NUMBER = 'Contact number is not a valid phone number',
  CANNOT_CREATE_CONTACT_WITHOUT_USER_NUMBER = 'Cannot create a contact without the User phone number',
  CANNOT_CREATE_CONTACT_WITHOUT_CONTACT_NUMBER = 'Cannot create a contact without the Contact phone number',
  USER_CANNOT_BE_CONTACT = 'User number cannot be a contact',
  CANNOT_MESSAGE_USER_TO_USER = 'Cannot start a conversation with another user',
}
