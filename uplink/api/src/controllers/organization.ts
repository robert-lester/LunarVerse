import * as deepMerge from 'deepmerge';
import * as Joi from 'joi';
import * as NosQL from '../../../../lib/nos-ql';
import {
  DeepPartial,
  Organization,
  PollingIntervalUnits,
  DEFAULT_CRM_INTEGRATION_VALUES
} from '../@types';

const ID_COLUMN = 'id';

export class OrganizationController {
  private tableName: string;

  public constructor(private nosql: NosQL) {
    this.tableName = `${process.env.API_RESOURCE_PREFIX}.organizations`;
  }

  private static format(org: Organization): Organization {
    if (org.mobileSync === undefined) {
      org.mobileSync = true;
    }

    if (org.integrationTokens === undefined) {
      org.integrationTokens = {};
    }

    if (org.uplinkSalesforceIntegration === undefined) {
      org.uplinkSalesforceIntegration = DEFAULT_CRM_INTEGRATION_VALUES;
    }

    if (org.smartAdvocateIntegration === undefined) {
      org.smartAdvocateIntegration = DEFAULT_CRM_INTEGRATION_VALUES;
    }

    if (org.genericCRMIntegration === undefined) {
      org.genericCRMIntegration = DEFAULT_CRM_INTEGRATION_VALUES;
    }

    let integrationsMetadata = [ 
      org.uplinkSalesforceIntegration.metadata,
      org.smartAdvocateIntegration.metadata,
      org.genericCRMIntegration.metadata,
    ];

    integrationsMetadata.forEach(metadata => {
      if (metadata.currentBatchLimit === undefined) {
        metadata.currentBatchLimit = 100; // TODO: Put this in a static config
      }

      if (metadata.currentBatchOffset === undefined) {
        metadata.currentBatchOffset = 0;
      }

      if (metadata.currentFilterOffset === undefined) {
        metadata.currentFilterOffset = 0;
      }

      if (metadata.currentBatchLowerBoundMessageId === undefined) {
        metadata.currentBatchLowerBoundMessageId = null;
      }

      if (metadata.currentBatchUpperBoundTimestamp === undefined) {
        metadata.currentBatchUpperBoundTimestamp = null;
      }

      if (metadata.lastSuccessfulSync === undefined) {
        metadata.lastSuccessfulSync = null;
      }
    });

    return org;
  }

  public async index() {
    this.nosql.setTable(this.tableName, ID_COLUMN);

    return (await this.nosql.index() as Organization[]).map(OrganizationController.format);
  }

  public async read(slug: string) {
    this.nosql.setTable(this.tableName, ID_COLUMN);

    const org = await this.nosql.read(slug);

    if (org === undefined) {
      return null;
    }
    return OrganizationController.format(org);
  }

  public async isSendWebConversationDuplicates(slug: string): Promise<boolean> {
    const org = await this.read(slug);
    // There will be a toggle stored in the organizations DynamoDB table
    // indicating whether or not to send duplicate messages of a given
    // user's Web conversation back to the user's phone.
    return org.mobileSync ? org.mobileSync : true;
  }

  /**
   * Deeply updates an organization
   *
   * Since GraphQL updates on the organization object can be deeply nested,
   * this method ensures that you don't need to know all of the existing values
   * in order to avoid overriding child values when doing updates.
   *
   * The deep merge algorithm operates recursively, merging leaf nodes first,
   * then moving up the tree.
   *
   * In the case of array values, the new array always replaces the original in
   * its entirety.
   *
   * @param fields A deeply nested field hash
   */
public async updateDeeply(fields: DeepPartial<Organization> & { slug?: string }) {
    const { slug } = fields;
    delete fields.slug;

    Joi.assert(fields, {
      uplinkSalesforceIntegration: Joi.object({
        flags: Joi.object({
          associateOnContactOrLeadCreation: Joi.boolean().optional(),
          syncCalls: Joi.boolean().optional(),
          syncMessages: Joi.boolean().optional(),
          syncRecords: Joi.boolean().optional(),
        }).optional(),
        metadata: Joi.object({
          currentBatchLimit: Joi.number().optional(),
          currentBatchOffset: Joi.number().optional(),
          currentFilterOffset: Joi.number().optional(),
          currentBatchLowerBoundMessageId: Joi.string().allow(null).optional(),
          currentBatchUpperBoundTimestamp: Joi.number().allow(null).optional(),
          lastSuccessfulSync: Joi.number().optional(),
        }).optional(),
      }).optional(),
      smartAdvocateIntegration: Joi.object({
        flags: Joi.object({
          associateOnContactOrLeadCreation: Joi.boolean().optional(),
          syncCalls: Joi.boolean().optional(),
          syncMessages: Joi.boolean().optional(),
          syncRecords: Joi.boolean().optional(),
        }).optional(),
        metadata: Joi.object({
          currentBatchLimit: Joi.number().optional(),
          currentBatchOffset: Joi.number().optional(),
          currentFilterOffset: Joi.number().optional(),
          currentBatchLowerBoundMessageId: Joi.string().allow(null).optional(),
          currentBatchUpperBoundTimestamp: Joi.number().allow(null).optional(),
          lastSuccessfulSync: Joi.number().optional(),
        }).optional(),
      }).optional(),
      genericCRMIntegration: Joi.object({
        flags: Joi.object({
          associateOnContactOrLeadCreation: Joi.boolean().optional(),
          syncCalls: Joi.boolean().optional(),
          syncMessages: Joi.boolean().optional(),
          syncRecords: Joi.boolean().optional(),
        }).optional(),
        metadata: Joi.object({
          currentBatchLimit: Joi.number().optional(),
          currentBatchOffset: Joi.number().optional(),
          currentFilterOffset: Joi.number().optional(),
          currentBatchLowerBoundMessageId: Joi.string().allow(null).optional(),
          currentBatchUpperBoundTimestamp: Joi.number().allow(null).optional(),
          lastSuccessfulSync: Joi.number().optional(),
        }).optional(),
      }).optional(),
    });
    this.nosql.setTable(this.tableName, ID_COLUMN);
    fields.updatedAt = new Date().getTime();

    const previous = await this.read(slug);

    if (previous === null) {
      return null;
    }
    fields = OrganizationController.format(deepMerge(previous, fields, {
      arrayMerge: (dest, source) => source,
    }));
    delete fields.id;

    return this.nosql.update(slug, fields) as Organization;
  }
}