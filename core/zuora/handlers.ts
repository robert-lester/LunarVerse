import * as Joi from 'joi';
import * as convert from 'xml-js';
import * as API from '../core';
import { AuthorizationController } from '../auth';
import BasicAuth from '../../lib/basic-auth';
import { HTTPError, HTTPHandler } from '../../lib/lambda-context';
import { ZuoraCalloutRequest } from './@types';

const ipRangecheck = require('ip-range-check');

const authController = new AuthorizationController();
const user = new API.UserController(authController);
const group = new API.GroupController(authController);
const org = new API.OrganizationController(group, user, authController);

/**
 * Utility for getting the value for a Zuora field, given its name
 * @param callout The parsed JSON body of a Zuora XML Callout request
 * @param fieldName The name of the field to find
 */
const getCalloutFieldValue = (callout: ZuoraCalloutRequest, fieldName: string): string => {
  const field = callout.elements[0].elements.find((element) => element.attributes.name === fieldName);

  if (!field) {
    return undefined;
  }
  return field.elements[0].text.replace(/\n\t/, '').trim();
};

/**
 * Creates an Uplink subscription with Zuora credentials, validating that the request originated from Zuora and parsing out the XML.
 */
export const createUplinkSubscription = new HTTPHandler({
  includeSuccess: true, // Zuora parses responses better if the response includes a "success" property
}).bind((event): Promise<Object> => { // TODO: Improve the "Object" type here once the Organization controller is type-safe
  const [username, password] = BasicAuth.decode(event.headers.Authorization || '');

  if (
    // Ensure the request originated from an address within the Zuora outbound IP ranges
    !ipRangecheck(
      event.requestContext.identity.sourceIp,
      ...(process.env.ZUORA_OUTBOUND_IP_RANGES.split(',')),
    ) ||
    // Ensure the Basic Auth usernames/passwords match what was input for Zuora
    // ASSUMPTION: HTTPS only, otherwise Basic Auth is not safe
    username !== process.env.ZUORA_USERNAME ||
    password !== process.env.ZUORA_PASSWORD
  ) {
    throw new HTTPError(401);
  }

  // The ugly types here are caused by JSON.parse returning "any"
  const callout = JSON.parse(convert.xml2json(event.body)) as ZuoraCalloutRequest;

  Joi.assert(callout, Joi.object({
    declaration: {
      attributes: {
        encoding: 'UTF-8',
        version: '1.0',
      },
    },
    elements: Joi.array().items({
      elements: Joi.array().items({
        attributes: {
          name: Joi.string().min(1).required(),
        },
        elements: Joi.array().items({
          text: Joi.string().min(1).required(),
          type: 'text',
        }).required(),
        name: 'parameter',
        type: 'element',
      }),
      name: 'callout',
      type: 'element',
    }).required().min(1).max(1),
  }));
  // The custom field names are currently pulled out of the environment since we haven't yet decided/discovered which objects and field names we can use
  const orgName = getCalloutFieldValue(callout, 'SubscriptionOrganization_Name__c');
  const adminUserFirstName = getCalloutFieldValue(callout, 'SoldToContactFirstName');
  const adminUserLastName = getCalloutFieldValue(callout, 'SoldToContactLastName');
  const adminUserEmail = getCalloutFieldValue(callout, 'SoldToContactWorkEmail');
  const accountId = getCalloutFieldValue(callout, 'AccountId');
  const orderId = getCalloutFieldValue(callout, 'OrderId');
  const subscriptionId = getCalloutFieldValue(callout, 'SubscriptionId');

  return org.create(orgName, [
    {
      name: `${adminUserFirstName} ${adminUserLastName}`,
      email: adminUserEmail,
    },
  ], {
    mfaRequired: false,
    primaryApplication: 'Uplink',
    uplinkPlan: {},
    zuora: {
      accountId,
      orderId,
      subscriptionId,
    },
  } as any, true);
});