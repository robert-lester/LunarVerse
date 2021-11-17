/** Activity */
export enum ActivityMessaging {
  GET_CHART_DATA_ERROR = 'There was an error fetching the chart data.',
  GET_ACTIVITY_DATA_ERROR = 'There was an error fetching the data for this record.',
  NO_USER_TO_USER = 'You cannot send a message to an Uplink user.'
}

/** Assign Numbers */
export enum AssignNumbersMessaging {
  SAVE_NUMBER_ASSIGNMENTS_SUCCESS = 'Assignment updates saved successfully.',
  SAVE_NUMBER_ASSIGNMENTS_ERROR = 'There was an error saving the assignments.',
  SAVE_USERS_SUCCESS = 'User updates saved successfully.',
  SAVE_USERS_ERROR = 'There was an error saving user updates.',
  NO_UNASSIGNED_USERS = 'There are no unassigned users.',
  NO_NUMBERS_TO_FORWARD = 'There are no numbers to forward.'
}

/** Start Conversation in SF */
export enum StartConversationMessaging {
  START_CONVERSATION_SUCCESS = 'Conversation started successfully.',
  START_CONVERSATION_ERROR = 'There was an error starting the conversation.',
  // TODO: Use the enums from the lib/api-errors once we get the webpack working
  // with directories outside of src
  INVALID_CONTACT_NUMBER = 'The contact phone number is invalid. Please reach out to them to confirm, and try again. If you continue to receive this error please reach out to Uplink Customer Success at success@belunar.com.',
}

/** Server errors that can be thrown when starting a conversation */
export enum StartConversationServerErrorMessaging {
  'GraphQL error: Contact number is not a valid phone number' = 'INVALID_CONTACT_NUMBER',
}

/** Messages */
export enum MessagesMessaging {
  GET_CONVERSATIONS_ERROR = 'There was an error fetching conversations.',
  GET_CONVERSATION_ERROR = 'There was an error fetching the conversation.',
  START_CONVERSATION_SUCCESS = 'Conversation started successfully.'
}

/** Plan */
export enum PlanMessaging {
  GET_PLAN_ERROR = 'There was an error fetching plan details.',
  GET_USAGE_DATA_ERROR = 'There was an error fetching usage data.',
}

/** Authentication */
export enum AuthenticationMessaging {
  RESEND_MFA_CODE_SUCCESS = 'Code resent successfully.',
  RESEND_MFA_CODE_ERROR = 'There was an error resending the code.',
  AUTH_ERROR = 'Authentication error. You have been redirected to the login screen.',
  AUTH_SF_ERROR = 'Authentication error.',
  TOO_MANY_ATTEMPTS = 'You have failed to sign in too many times. Please contact our customer support to have your account re-enabled.',
  SEND_RESET_PASSWORD_EMAIL_SUCCESS = 'If your email address is in our system, a confirmation code has been sent to it.',
  SEND_RESET_PASSWORD_EMAIL_ERROR = 'There was en error sending the email.',
  RESET_PASSWORD_ERROR = 'There was an error resetting your password.',
  RESET_PASSWORD_SUCCESS = 'Password changed successfully. Logging you in.',
  REGISTER_PHONE_NUMBER_ERROR = 'There was an error registering that phone number.',
  REGISTER_PHONE_NUMBER_SUCCESS = 'Phone number registered successfully.'
}

/** User */
export enum UserMessaging {
  DELETE_USER_SUCCESS = 'User deletion successful.',
  DELETE_USER_ERROR = 'There was an error deleting the user.',
  CREATE_NEW_USER_SUCCESS = 'User creation successful.',
  CREATE_NEW_USER_ERROR = 'The phone number for this user is already in use.',
  NO_USER_DATA = 'There was no user found with the configured phone number.'
}

/** User Numbers */
export enum UserNumbersMessaging {
  GET_USER_NUMBERS_DATA_ERROR = 'There was an error fetching user numbers.',
  GET_ALL_USER_NUMBERS_DATA_ERROR = 'There was an error fetching all user numbers.'
}

/** Users */
export enum UsersMessaging {
  GET_UNASSIGNED_USERS_DATA_ERROR = 'There was an error fetching unassigned users.',
  GET_USERS_ERROR = 'There was an error fetching users.'
}

/** General */
export enum GeneralMessaging {
  UNKNOWN_ERROR = 'Unknown error. Please contact support.'
}

/** URL Token */
export enum URLTokenMessaging {
  VERIFY_URL_TOKEN_ERROR = 'Login credentials have expired. Please reach out to Customer Success for help at success@belunar.com.'
}

/** URL Token */
export enum AuthTokenMessaging {
  REFRESH_AUTH_TOKEN_ERROR = 'There was an error with your session. Please login again.'
}

export enum SalesforceSettingsMessaging {
  SAVE_SALESFORCE_SETTINGS_SUCCESS = 'Salesforce settings updates saved successfully.',
  SAVE_SALESFORCE_SETTINGS_ERROR = 'There was an error saving the Salesforce settings.',
  GET_SALESFORCE_SETTINGS_DATA_ERROR = 'There was an error fetching the Salesforce settings.'
}

export enum SmartAdvocateSettingsMessaging {
  SAVE_SMARTADVOCATE_SETTINGS_SUCCESS = 'SmartAdvocate settings updates saved successfully.',
  SAVE_SALESFORCE_SETTINGS_ERROR = 'There was an error saving the SmartAdvocate settings.',
  GET_SALESFORCE_SETTINGS_DATA_ERROR = 'There was an error fetching the SmartAdvocate settings.'
}

export enum GenericCRMSettingsMessaging {
  SAVE_GENERIC_CRM_SETTINGS_SUCCESS = 'Generic CRM settings updates saved successfully.',
  SAVE_GENERIC_CRM_SETTINGS_ERROR = 'There was an error saving the Generic CRM settings.',
  GET_GENERIC_CRM_SETTINGS_DATA_ERROR = 'There was an error fetching the Generic CRM settings.'
}