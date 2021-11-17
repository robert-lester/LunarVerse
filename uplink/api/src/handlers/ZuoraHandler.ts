import * as Knex from 'knex';
import * as moment from 'moment';
import * as Util from 'util';

import { ScheduleHandler } from '../../../../lib/lambda-context';
import * as NosQL from '../../../../lib/nos-ql';
import { ZuoraRESTSDK, ZuoraUsageRow } from '../../../../lib/zuora-rest-sdk';

import KnexUtils from '../lib/knex';
import { getBillableUnitsQueryBuilder } from '../lib/usage';
import ZuoraUtils from '../lib/zuora';

import knexfile from '../database/knexfile';

import { OrganizationController } from '../controllers';
import {
  Organization,
  MessageType,
  ZuoraUnitsOfMeasure,
} from '../@types';

const FAKE_ZUORA_ACCOUNT_ID = 'A00000000';

const IS_PROD = process.env.STAGE.includes('prod');

// TODO: Add a DB flag to ensure that each org's usage gets marked as uploaded so we know who is/is not up-to-date

const getUsageRowFactory = (start: moment.Moment, end: moment.Moment) => (
  org: Organization,
  usage: Array<UsageQueryResult>,
  uom: ZuoraUnitsOfMeasure,
  measureText: string,
): ZuoraUsageRow => ({
  ACCOUNT_ID: org.zuora.accountId,
  UOM: uom,
  QTY: (usage.find((row) => row.organization_id === org.id) || { count: 0 }).count,
  STARTDATE: ZuoraUtils.momentToZuoraUsageFormat(start),
  // Zuora uses ENDDATE inclusively while we use ours exclusively so we need to
  // treat these as the same date
  ENDDATE: ZuoraUtils.momentToZuoraUsageFormat(end),
  SUBSCRIPTION_ID: org.zuora.subscriptionId,
  CHARGE_ID: '',
  DESCRIPTION: `Uplink ${measureText} used by the ${org.name} organization.`,
});

const getUsageQueryBuilder = (
  orgs: Array<string>,
  startDate: string,
  endDate: string,
) => (knex: Knex) => getBillableUnitsQueryBuilder(knex)(orgs, new Date(startDate), new Date(endDate))
  .groupBy('organization_id');

const messageQueryBuilder = (qb: Knex.QueryBuilder) => qb.where('type', MessageType.USER);

interface UsageQueryResult {
  count: number;
  organization_id: string;
}

const uploadUsageCSVController = async () => {
  // NOTE: Comment out the .subtract(1, 'day') to test the current date
  const start = moment.utc().subtract(1, 'day');
  const end = start.clone();
  let knex: Knex;

  try {
    // Initialize NoSQL DB
    const organizationController = new OrganizationController(new NosQL());

    // Initialize SQL DB
    knex = Knex(knexfile);
    console.info('Database connection opened');

    // Get the list of org IDs with subscription details attached in Dynamo
    const orgs = await organizationController.index();
    const subscribedOrgs = orgs.filter((org) => org.zuora !== undefined && org.zuora.accountId !== FAKE_ZUORA_ACCOUNT_ID);
    const subscribedOrgIds = subscribedOrgs.map((org) => org.id);
    console.info('Fetching usage for subscribed orgs: ', subscribedOrgIds);

    // Create a reusable wrapper to use for generating the three usage queries
    const usageQueryBuilder = getUsageQueryBuilder(
      subscribedOrgIds,
      KnexUtils.momentToKnexFormat(start),
      KnexUtils.momentToKnexFormat(end),
    );

    // Make three simultaneous queries against all three kinds of usage
    const [
      mediaMessageUsage,
      smsMessageUsage,
      voiceMinuteUsage,
    ]: [Array<UsageQueryResult>, Array<UsageQueryResult>, Array<UsageQueryResult>] = await Promise.all([
      messageQueryBuilder(usageQueryBuilder(knex)).whereNotNull('media').andWhere('media', '!=', '[]'),
      messageQueryBuilder(usageQueryBuilder(knex)).where('media', '=', '[]'),
      usageQueryBuilder(knex).where('type', MessageType.CALL),
    ]);
    console.info('Usage collected. Formatting usage into CSV rows...');

    // Injecting date dependencies to create a function we can use to form CSV rows
    const getUsageRow = getUsageRowFactory(start, end);

    // Map the data to Zuora-formatted CSV row objects, filling in empty ones where needed
    const rows = Array.prototype.concat(...subscribedOrgs.map((org) => ([
      getUsageRow(org, mediaMessageUsage, ZuoraUnitsOfMeasure.MEDIA, 'media messages'),
      getUsageRow(org, smsMessageUsage, ZuoraUnitsOfMeasure.SMS, 'SMS messages'),
      getUsageRow(org, voiceMinuteUsage, IS_PROD ? ZuoraUnitsOfMeasure.VOICE : ZuoraUnitsOfMeasure.VOICESANDBOX, 'voice minutes'),
    ])));
    console.info('CSV usage rows: ', rows);
    console.info('Initializing Zuora connection...');

    // Break the rows into batches so we don't hit the limit
    const zuora = new ZuoraRESTSDK({
      password: process.env.ZUORA_API_PASSWORD,
      sandbox: !process.env.STAGE.includes('prod'),
      username: process.env.ZUORA_API_USERNAME,
    });
    console.info('Zuora connection initialized. Uploading usage...');

    // Create the rows
    const results = await zuora.Usage.create(rows);

    console.info('Usage upload call results: ', results);
  } finally {
    await Util.promisify(knex.destroy);
    console.info('Connection connection closed');
  }
};

// export const uploadUsageCSV = uploadUsageCSVController;
export const uploadUsageCSV = new ScheduleHandler()
  .bind(uploadUsageCSVController);

