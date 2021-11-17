import * as Joi from 'joi';
import * as Knex from 'knex';
import { getOrganizationFromToken } from '../../core/auth';
import Controller from './Controller';
import HTTPException from '../exceptions/HTTPException';
import config from '../database/knexfile';
// tslint:disable-next-line
const Lambda = require('../../lib/lambda++');

interface ResendParams {
  destination_id: number;
  pod_id: number;
}

export const intake = (event, context, callback) => {
  const body = Lambda.parseBody(event.body);

  if (!body.api_key && !(event.queryStringParameters || {}).api_key) {
    Lambda.handleError(new HTTPException('Missing api_key', 400), callback);
  } else if (body.api_key && (event.queryStringParameters || {}).api_key) {
    Lambda.handleError(new HTTPException('api_key must be in either body or query string, not both', 400), callback);
  } else {
    if (!body.api_key) {
      body.api_key = event.queryStringParameters.api_key;
    }
    const controller = new Controller(Knex(config));
    const { api_key, ...submissionData } = body;
    
    controller.prepareSubmission(api_key, submissionData)
      .then(({ pod, source }) => {
        Lambda.response({ pod_id: pod.id, result: 200 }, callback);
        return controller.distributePOD(pod, source);
      })
      .then(() => {
        controller.closeConnection();
      })
      .catch((err) => {
        controller.closeConnection();
        console.error(err.stack);
      });
  }
};

export const resend = Lambda.bindHandler(async (event) => {
  const controller = new Controller(Knex(config));

  try {
    const accessToken = Lambda.parseToken(event.headers);
    const body = Lambda.parseBody(event.body);
    const { error, value: { destination_id, pod_id } }: Joi.ValidationResult<ResendParams> = Joi.validate(body, {
      destination_id: Joi.number().integer().min(1).required(),
      pod_id: Joi.number().integer().min(1).required(),
    });

    if (error !== null) {
      throw new HTTPException(error.message, 400);
    }
    const organizationSlug = await getOrganizationFromToken(accessToken);
    await controller.sendPODToDestination(organizationSlug, pod_id, destination_id);
    controller.closeConnection();
    return {
      pod_id,
      result: 200,
    };
  } catch (err) {
    controller.closeConnection();
    throw err;
  }
});
