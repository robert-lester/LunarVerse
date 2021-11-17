import * as Knex from 'knex';

import config from '../../database/knexfile';
import { VisitController } from '../controllers';
import * as Lambda from '../../../lib/lambda++';

export const handler = Lambda.bindHandler(async (event) => {
  const controller = new VisitController(Knex(config));

  try {
    const { visitId } = event.pathParameters;
    const results = await controller.read(visitId);

    controller.closeConnection();

    return results;
  } catch (err) {
    controller.closeConnection();
    throw err;
  }
});
