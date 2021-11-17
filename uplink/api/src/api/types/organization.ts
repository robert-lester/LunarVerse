export default /* GraphQL */ `
  enum PollingIntervalUnits {
    minutes
  }

  type SalesforceIntegrationFlags {
    associateOnContactOrLeadCreation: Boolean!
    syncCalls: Boolean!
    syncMessages: Boolean!
    syncRecords: Boolean!
  }

  type SalesforceIntegrationMetadata {
    lastBatchStarted: Date
    lastSuccessfulSync: Date
  }

  type SalesforceIntegrationPollingInterval {
    increment: Int!
    unit: PollingIntervalUnits!
  }

  type SalesforceIntegration {
    flags: SalesforceIntegrationFlags!
    metadata: SalesforceIntegrationMetadata!
    pollingInterval: SalesforceIntegrationPollingInterval!
  }

  type ZuoraConfig {
    accountId: String
    orderId: String
    subscriptionId: String
  }

  type Token {
    value: String!
  }

  type IntegrationTokens {
    salesforce: Token
    smartAdvocate: Token
    genericCRM: Token
  }

  type Organization {
    createdAt: Date!
    id: String!
    integrationTokens: IntegrationTokens!
    name: String!
    updatedAt: Date!
    uplinkPlan: BasePlan!
    uplinkSalesforceIntegration: SalesforceIntegration
    smartAdvocateIntegration: SalesforceIntegration
    genericCRMIntegration: SalesforceIntegration
    zuora: ZuoraConfig
    mobileSync: Boolean
  }

  input UpdateableSalesforceIntegrationFlagsFields {
    associateOnContactOrLeadCreation: Boolean
    syncCalls: Boolean
    syncMessages: Boolean
    syncRecords: Boolean
  }

  input UpdateableSalesforceIntegrationFields {
    flags: UpdateableSalesforceIntegrationFlagsFields!
  }

  input UpdateableOrganizationFields {
    slug: String!
    uplinkSalesforceIntegration: UpdateableSalesforceIntegrationFields
    smartAdvocateIntegration: UpdateableSalesforceIntegrationFields
    genericCRMIntegration: UpdateableSalesforceIntegrationFields
  }

  extend type Query {
    getOrganization(
      slug: String
    ): Organization
  }

  extend type Mutation {
    updateOrganization(
      fields: UpdateableOrganizationFields
    ): Organization
  }
`;