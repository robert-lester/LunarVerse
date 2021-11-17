import { TwilioDuringCallStatuses, TwilioFinalCallStatuses } from './enums';

export interface IAvailablePhoneOptions {
  voiceEnabled: boolean;
  smsEnabled: boolean;
  mediaMessagesEnabled: boolean;
  contains: string;
  nearLatLong: string;
  inLocality: string;
  inRegion: string;
  inLata: string;
  inPostalCode: string;
  areaCode?: string;
}

export interface ITwilioOptions {
  body: string;
  to: string;
  from: string;
}

export interface ITwilioBaseRequest {
  To: string;
  From: string;
}

export interface ITwilioMessageRequest extends ITwilioBaseRequest {
  Body: string;
  NumMedia: number;
  /**
   * The Message SID is the unique ID for any message successfully created by Twilio’s API. It is a 34 character string that starts with “SM…” for SMS and “MM…” for MMS.
   * MessageSid is optional for sending messages from the Web Application since this skips Twilio and accesses the serverless application directly.
   */
  MessageSid?: string;
}

export interface ITwilioCallRequest extends ITwilioBaseRequest {
  CallSid: string;
}

export interface ITwilioPurchaseResult {
  sid: string;
  phoneNumber: string;
}

export interface IVoiceSandbox {
  say: (text: string) => string;
  dial: () => ({
    number: (number: string) => void,
  });
}

export interface ISmsSandbox {
  messages: {
    create: (options: ITwilioOptions) => Promise<string>,
    media: (media: string) => ({
      remove: () => void,
    });
  };
  availablePhoneNumbers: () => ({
    tollFree: IListable,
    local: IListable,
  });
  incomingPhoneNumbers: {
    create: (params: ITwilioPurchaseResult) => ITwilioPurchaseResult,
  };
}
interface IListable {
  list: () => Array<{ phoneNumber: string; }>;
}

export interface ITwilioCallStatusRequest extends ITwilioCallRequest {
  AccountSid: string;
  ApiVersion: string;
  CallerName: null;
  CallDuration?: number; // Only present for "completed" status
  CallSid: string;
  CallStatus: TwilioDuringCallStatuses|TwilioFinalCallStatuses;
  Direction: 'inbound'|'outbound-api'|'outbound-dial';
  ForwardedFrom: string;
  From: string;
  ParentCallSid: string;
  To: string;
  SipResponseCode?: number; // Only presend for "failed" or "no-answer" status
}

// Declares the set of Twilio test SMS 'From' numbers
// https://www.twilio.com/docs/iam/test-credentials#test-sms-messages
export declare type TwilioTestFromSms = 'InvalidPhoneNumber' | 'NotSmsCapable' | 'NotOwnedByYou' | 'SmsQueueIsFull' | 'PassesAllValidation';

// Declares the set of Twilio test SMS 'To' numbers
// https://www.twilio.com/docs/iam/test-credentials#test-sms-messages
export declare type TwilioTestToSms = 'InvalidPhoneNumber' | 'NotSmsCapable' | 'CannotRoute' | 'NoInternational' | 'Blacklisted' | 'PassesAllValidation';