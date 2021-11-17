import { IPlanBase } from './';

export enum PollingIntervalUnits {
  MINUTES = 'minutes',
}

export const CRM_INTEGRATION_MESSAGE_QUERY_LIMIT = 100;

export const DEFAULT_CRM_INTEGRATION_VALUES: OrganizationSalesforceIntegration = {
  flags: {
    associateOnContactOrLeadCreation: false,
    syncCalls: false,
    syncMessages: false,
    syncRecords: false,
  },
  metadata: {
    currentBatchLimit: CRM_INTEGRATION_MESSAGE_QUERY_LIMIT,
    currentBatchOffset: 0,
    currentFilterOffset: 0,
    currentBatchLowerBoundMessageId: null,
    currentBatchUpperBoundTimestamp: null,
    lastSuccessfulSync: null,
  },
  pollingInterval: {
    increment: 15,
    unit: PollingIntervalUnits.MINUTES,
  },
};

export interface OrganizationSalesforceIntegrationMetadata {
  currentBatchLimit: number;
  currentBatchOffset: number;
  currentFilterOffset: number;
  currentBatchLowerBoundMessageId: null|string;
  currentBatchUpperBoundTimestamp: null|number;
  lastSuccessfulSync: null|number;
}

export interface OrganizationSalesforceIntegration {
  flags: {
    associateOnContactOrLeadCreation: boolean;
    syncCalls: boolean;
    syncMessages: boolean;
    syncRecords: boolean;
  };
  metadata: OrganizationSalesforceIntegrationMetadata;
  pollingInterval: {
    increment: 15,
    unit: PollingIntervalUnits,
  };
}

export interface Organization {
  createdAt: number;
  id: string;
  integrationTokens: {
    [integrationName: string]: {
      value: string;
    };
  };
  name: string;
  shuttlePlan: null;
  updatedAt: number;
  uplinkPlan: IPlanBase;
  uplinkSalesforceIntegration?: OrganizationSalesforceIntegration;
  smartAdvocateIntegration?: OrganizationSalesforceIntegration;
  genericCRMIntegration?: OrganizationSalesforceIntegration;
  userPoolClientId: string;
  userPoolId: string;
  zuora?: {
    accountId: string;
    orderId: string;
    subscriptionId: string;
  };
  mobileSync?: boolean;
}