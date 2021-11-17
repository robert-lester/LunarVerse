import * as Knex from 'knex';
import config from '../../database/knexfile';
import { DestinationController } from '../controllers';
import * as Lambda from '../../../lib/lambda++';

export const handler = Lambda.bindHandler(async (event) => {
  const controller = new DestinationController(Knex(config));

  try {
    const { code, state: organization } = event.queryStringParameters;

    await controller.sheetsOauth(organization, code);
    controller.closeConnection();

    return {
      status: 200,
    };
  } catch (err) {
    controller.closeConnection();
    throw err;
  }
});
