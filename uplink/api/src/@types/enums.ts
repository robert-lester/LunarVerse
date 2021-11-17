export enum PhoneType {
  CONTACT = 'CONTACT',
  USER = 'USER',
  POOL = 'POOL',
  FORWARD = 'FORWARD',
  UNASSIGNED = 'UNASSIGNED',
}

export enum AssignedType {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
}

export enum ZuoraUnitsOfMeasure {
  MEDIA = 'Media',
  SMS = 'SMS',
  VOICE = 'Minutes',
  VOICESANDBOX = 'Minute',
}

export enum UserType {
  CONTACT = 'CONTACT',
  USER = 'USER',
}

export enum MessageType{
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  CALL = 'CALL',
}

export enum Origin {
  PHONE = 'PHONE',
  WEB = 'WEB'
}

export enum DirectionType {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
  BOTH = 'BOTH',
}

export enum SortOptions {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum TwilioDuringCallStatuses {
  INITIATED = 'initiated',
  IN_PROGRESS = 'in-progress',
  QUEUED = 'queued', // If API is successful this is set
  RINGING = 'ringing',
}

export enum TwilioFinalCallStatuses {
  BUSY = 'busy',
  COMPLETED = 'completed',
  FAILED = 'failed',
  NO_ANSWER = 'no-answer',
}

export type TwilioCallStatuses = TwilioDuringCallStatuses & TwilioFinalCallStatuses;

export enum TwilioOptOutKeywords {
  STOP = 'STOP',
  STOPALL = 'STOPALL',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
  CANCEL = 'CANCEL',
  END = 'END',
  QUIT = 'QUIT',
  TESTOUT = 'TESTOUT',
}

export enum TwilioOptInKeywords {
  START = 'START',
  YES = 'YES',
  UNSTOP = 'UNSTOP',
  TESTIN = 'TESTIN',
}

export enum CommandType {
  START_CONVERSATION = 'CONVERSATION',
  START_CONVO = 'CONVO',
  UNKNOWN = 'UNKNOWN'
}

export enum StartConversationReferrer {
  MOBILE = 'Mobile',
  SALESFORCE = 'Salesforce',
}

export enum IntakeResponses {
  INVALID_INTERNATIONAL_NUMBER = 'Received an invalid international phone number',
  INCORRECT_PHONE_NUMBER_FORMAT = 'Incorrect phone number format',
  CANNOT_FIND_USER = 'Cannot find user with that number',
  CANNOT_FIND_CONTACT = 'Cannot find contact with that number',
  EXCEEDS_MAX_SIZE_MESSAGE = 'The message exceeds the maximum size of',
  USER_TO_USER_INVALID = 'User cannot send to another user',
  INVALID_DESTINATION_NUMBER = 'Invalid destination number',
  INTERNAL_SYSTEM_ERROR = 'Uplink has encountered an internal system error.',
  SUCCESS = 'Successfully sent message.',
}
