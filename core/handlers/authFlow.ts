import * as Joi from 'joi';
import { HTTPHandler } from '../../lib/lambda-context';
import * as lambda from '../../lib/lambda++';
import AuthFlowController from '../controllers/AuthFlowController';
import { AuthorizationController } from '../auth';
import { authorizeToken } from '../lib/authorizer';
import * as ValidationException from '../exceptions/ValidationException';
const areaCodeStateMap = require('../../lib/data/ac_state_map.json');

// Controller dependencies
const authController = new AuthorizationController();
const controller = new AuthFlowController(authController);

// Call the createUser function in Auth Flow Controller
// Return the new user and a status
export const addUser = new HTTPHandler()
  .bind(async (event) => {
    const { attributes, email } = lambda.parseBody(event.body);
    const params = event.queryStringParameters || {};

    Joi.assert({
      email,
      attributes,
      resend: params.resend,
    },
    {
      email: Joi.string().email().required(),
      attributes: Joi.object().keys({
        groups: Joi.array().items(Joi.string()).default([]),
        name: Joi.string().required(),
      }).required(),
      resend: Joi.boolean().default(false),
    });
    const userPoolId: string = await authorizeToken(event);

    const userData = await controller.getOrgForUser(email, attributes, userPoolId, params.resend ? true : false);

    return userData;
  });

// Call the decryptUserData function in Auth Flow Controller
// Return the decrypted user data and a status
export const decryptToken = new HTTPHandler()
  .bind(async (event) => {
    const { token } = lambda.parseBody(event.body);

    Joi.assert({
      token,
    },
    {
      token: Joi.string(),
    });
    const userData = await controller.decryptUserData(token);

    return userData;
  });

// Call the createOrg function in Auth Flow Controller
// Return the new org and a status
export const createOrg = new HTTPHandler()
  .bind(async (event) => {
    const { name, admins, attributes } = lambda.parseBody(event.body);

    Joi.assert({
      name,
      admins,
      attributes,
    },
    {
      name: Joi.string().required(),
        admins: Joi.array().min(1).items(Joi.object().keys({
          email: Joi.string()
            .email()
            .required(),
          name: Joi.string().required(),
        })).required(),
        // Alternative schemas are required for Shuttle vs. Uplink attributes
        attributes: Joi.alternatives().try(
          Joi.object().keys({
            mfaRequired: Joi.boolean().required(),
            primaryApplication: 'Shuttle',
          }),
          Joi.object().keys({
            mfaRequired: Joi.boolean().required(),
            primaryApplication: 'Uplink',
            // Uplink plan should conform to IPlanBase in /uplink/api/src/@types/plan.d.ts
            // TODO: Formalize this by moving core to TypeScript
            uplinkPlan: Joi.object().keys({
              // RegExp matches dates in format YYYY-MM-DD
              billingStartDate: Joi.string().regex(/^20\d\d-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[01])$/).default(new Date().toISOString().split('T')[0]),
            }).required(),
            uplinkUserNumbers: Joi.number().integer().min(0).default(0),
            uplinkUserNumberAreaCode: Joi.number().integer()
              .valid(...Object.keys(areaCodeStateMap).map(code => parseInt(code, 10))).optional()
              .error(new ValidationException('Invalid area code')),
            zuora: Joi.object().keys({
              accountId: Joi.string().regex(/^A\d{8}$/).required(),
              orderId: Joi.string().regex(/^O-\d{8}$/).required(),
              subscriptionId: Joi.string().regex(/^A-S\d{8}$/).required(),
            }).required(),
          }),
        ).required(),
        fromZuora: Joi.boolean().default(false),
    });
    const userPoolId: string = await authorizeToken(event);

    const orgData = await controller.createOrg(name, admins, attributes, false, userPoolId);
    
    return orgData;
  });

export const updateOrg = new HTTPHandler()
  .bind(async (event) => {
    const { orgSlug } = event.pathParameters;
    return await controller.updateOrg(await authorizeToken(event));
});

// Call the forgotPassword function in Auth Flow Controller
// Return a status
export const forgotPassword = new HTTPHandler()
  .bind(async (event) => {
    const { orgSlug, email }: { orgSlug: string, email: string } = lambda.parseBody(event.body);

    Joi.assert({
      orgSlug,
      email,
    },
    {
      orgSlug: Joi.string().required(),
      email: Joi.string().required(),
    })
    const formattedEmail: string = (email || '').toLowerCase();
    await controller.forgotPassword(orgSlug, formattedEmail);

    return 'Success';
  });
