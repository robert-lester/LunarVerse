import { intakeRouter } from '../routes';
import { BaseHandler } from './BaseHandler';

class IntakeHandler extends BaseHandler {}

export const handler = IntakeHandler.handler(intakeRouter);
