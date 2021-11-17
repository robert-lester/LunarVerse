import moment from 'moment';
import { Sort } from '../types';

/** General Types */

export interface User {
  color: string;
  directDialNumber: string;
  id: number;
  name: string;
  phoneNumber: UserPhoneNumber | null;
  physicalNumber: string;
  systemNumber: string;
  type: UserNumberType;
}

export interface UserPhoneNumber {
  id: number;
  systemNumber: string;
}

export interface NewUser {
  name: string;
  physicalNumber: string;
}

export enum UserType {
  CONTACT = 'CONTACT',
  FORWARD = 'FORWARD',
  POOL = 'POOL',
  USER = 'USER'
}

/** User Number */

export interface UpdatingUserNumber {
  id: number;
  assigned_id?: number | null;
  type: UserNumberType;
}

export enum UserNumberType {
  CONTACT = 'CONTACT',
  FORWARD = 'FORWARD',
  UNASSIGNED = 'UNASSIGNED',
  POOL = 'POOL',
  USER = 'USER',
  RECYCLED = 'RECYCLED'
}

export interface UserNumber {
  forward: UserNumber | null;
  id: number;
  messages: Message[];
  systemNumber: string;
  type: UserNumberType;
  user: User;
  callOrText30Days: boolean;
}

export interface Sender {
  color: string;
  id: number;
  name: string;
  type: string;
}

export interface ConversationData {
  id: number;
  phoneNumbers: UserNumber[];
  messages: Message[];
  updated_at: string;
  public_id: string;
}

export interface GetUsersList {
  value: string;
  element: JSX.Element;
}

export interface UpdatedUserInfo {
  id: number;
  name?: string;
  physicalNumber?: string;
}

/** Users */

export interface CreateUserData {
  createUser: User;
}

export interface GetUsersData {
  getUsers: User[];
}

export interface GetUserData {
  getUserByPhysicalPhone: User;
}

export interface GetAllUsersData {
  getPhoneNumbers: User[];
}

export interface UpdateUsersVariables {
  updates: {
    id: number;
  }[];
}

export interface DeleteUserVariables {
  id: number;
}

export interface CreateNewUserVariables {
  name: string;
  physicalNumber: string;
}

/** Usage */

export interface UsageMessage {
  inBoundSMS: UsageSubData[];
  inBoundMediaMessages: UsageSubData[];
  outBoundSMS: UsageSubData[];
  outBoundMediaMessages: UsageSubData[];
}

export interface UsageVoice {
  inBound: UsageSubData[];
  outBound: UsageSubData[];
}

export interface UsageData {
  message: UsageMessage;
  voice: UsageVoice;
}

export interface UsageSubData {
  count: number;
  date: string;
}

export interface UsageByPhone extends UsageData {
  systemNumber: string;
}

export interface UsageSubDataTotal {
  count: number;
}

export interface UsageMessageTotal {
  inBoundSMS: UsageSubDataTotal;
  inBoundMediaMessages: UsageSubDataTotal;
  outBoundSMS: UsageSubDataTotal;
  outBoundMediaMessages: UsageSubDataTotal;
}

export interface UsageVoiceTotal {
  inBound: UsageSubDataTotal;
  outBound: UsageSubDataTotal;
}

export interface UsageTotals {
  message: UsageMessageTotal;
  voice: UsageVoiceTotal;
}
export interface Usage {
  usage: UsageData;
  usageByPhone: UsageByPhone[];
  totals: UsageTotals;
}

export interface GetUsageData {
  getUsage: Usage;
}

/** Plans */
export interface GetPlanData {
  getPlan: PlanData;
}

export interface PlanDataSet {
  used: number;
  included: number;
}

export interface PlanData {
  numbers: PlanDataSet;
  usage: {
    smsMessages: number;
    mmsMessages: number;
    voiceMinutes: number;
  };
  usageCycle: {
    endDate: string;
    startDate: string;
  };
}

export interface DateRange {
  initial: moment.Moment | null;
  final: moment.Moment | null;
}

export enum BillingCycles {
  ANNUALLY = 'annually',
  MONTHLY = 'monthly'
}

/** Messages */
export interface GetAllUserNumbersData {
  getPhoneNumbers: UserNumber[];
}

export interface GetConversationData {
  getConversation: ConversationData;
}

export interface GetConversationsData {
  getConversations: ConversationData[];
}

export interface GetConversationsVariables {
  selectedNumbers: string[];
  dateRange: DateRange;
  sort: Sort;
}

export interface GetConversationVariables {
  id: number;
}

export interface GetUserNumberUsageData {
  getPlan: {
    numbers: {
      used: number;
      included: number;
    };
  };
}

export interface Media {
  mime_type: string;
  url: string;
}

export interface SenderPhone {
  systemNumber: string;
}

export interface Message {
  media: Media[];
  created_at: string;
  sender: Sender;
  message: string;
  public_id: string;
  type: UserMessageType;
  phoneNumber: SenderPhone;
  duration: number;
}

export enum UserMessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  CALL = 'CALL'
}

/** Activity */

export interface Activity {
  firstInBound: string;
  firstOutBound: string;
  id: number;
  invite: string;
  lastInBound: string;
  lastOutBound: string;
  physicalNumber: string;
  status: string;
  systemNumber: string;
  isUser: boolean;
}
export interface GetActivityData {
  getActivity: Activity;
}

/** Info */
export interface CreateContactData {
  createContact: {
    systemNumber: string;
  };
}

/** Auth */
export interface AuthData {
  email?: string;
  orgSlug?: string;
  password?: string;
  session?: string;
  confirmationCode?: string;
  confirmPassword?: string;
}

export interface MFAData {
  status: string;
  session: string;
}

export interface RegisterPhoneNumberData {
  numberRegistration: MFAData;
}

export interface ResendMFAData {
  resendMFA: MFAData;
}

export type AuthToken = string;

export interface AuthTokenData {
  tokenDetail: {
    accessToken: string;
  }
}

/** URL Token */
export interface URLToken {
  orgSlug: string;
  email: string;
  name:string;
}

export interface URLTokenData {
  verifyURLToken: URLToken
}

/** Salesforce Settings */

export interface IntegrationSettings {
  integrationTokens: {
    salesforce: {
      value: string;
    }
    smartAdvocate: {
      value: string;
    }
    genericCRM: {
      value: string;
    }
  }
  uplinkSalesforceIntegration: {
    flags: IntegrationSettingsFlags;
    metadata: {
      lastSuccessfulSync: number;
    };
    pollingInterval: {
      increment: number;
      unit: string;
    }
  }
  smartAdvocateIntegration: {
    flags: IntegrationSettingsFlags;
    metadata: {
      lastSuccessfulSync: number;
    };
    pollingInterval: {
      increment: number;
      unit: string;
    }
  }
  genericCRMIntegration: {
    flags: IntegrationSettingsFlags;
    metadata: {
      lastSuccessfulSync: number;
    };
    pollingInterval: {
      increment: number;
      unit: string;
    }
  }
}

export interface GetIntegrationSettingsData {
  getOrganization: IntegrationSettings;
}

export interface UpdateIntegrationSettingsData {
  updateOrganization: IntegrationSettings;
}

export interface IntegrationSettingsFlags {
  syncCalls: boolean;
  syncRecords: boolean;
  syncMessages: boolean;
  __typename?: string;
}