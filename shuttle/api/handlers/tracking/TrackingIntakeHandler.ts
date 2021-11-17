import * as Knex from 'knex';
import * as Joi from 'joi';

import config from '../../../database/knexfile';
import HTTPException from '../../../exceptions/HTTPException';
import { TrackingIntakeController } from '../../controllers';
import * as Lambda from '../../../../lib/lambda++';

const schema = {
  data: {
    current_url: Joi.string().required(),
    element: Joi.any().optional(),
    referrer: Joi.string().optional(),
  },
  event_tag: Joi.string().required(),
  load_uid: Joi.string().optional(),
  site_uid: Joi.string().optional(),
  state: Joi.string().required(),
  timestamp: Joi.string().optional(),
  uid: Joi.string().required(),
};

export const handler = Lambda.bindHandler(async (event) => {
  const controller = new TrackingIntakeController(Knex(config));

  try {
    const body = Joi.attempt(Lambda.parseBody(event.body), schema);
    const { sourceIp, userAgent } = event.requestContext.identity;

    const siteId = await controller.verifySite(body.data);

    if (!siteId) {
      throw new HTTPException('Site does not exist', 404);
    }
    body.sourceIp = sourceIp;
    body.userAgent = userAgent;
    body.site_uid = siteId;

    await controller.upsertVisitor(body);
    const newEvent = await controller.createEvent(body);

    controller.closeConnection();

    return {
      id: newEvent.uid,
      message: 'Event created successfully',
    };
  } catch (err) {
    controller.closeConnection();
    throw err;
  }
});
