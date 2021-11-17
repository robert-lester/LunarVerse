import * as Knex from 'knex';
import * as Joi from 'joi';

import config from '../../database/knexfile';
import { SiteController } from '../controllers';
import * as Lambda from '../../../lib/lambda++';

const schema = {
  domain: Joi.string().required(),
  name: Joi.string().required(),
};

export const handler = Lambda.bindHandler(async (event) => {
  const controller = new SiteController(Knex(config));

  try {
    const body = Joi.attempt(Lambda.parseBody(event.body), schema);
    const results = await controller.create(body);

    controller.closeConnection();

    return {
      status: 200,
      body: results,
    };
  } catch (err) {
    controller.closeConnection();
    throw err;
  }
});
