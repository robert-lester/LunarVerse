import { UplinkGraphQLException } from './UplinkGraphQLException';
import { IntakeResponses, IntakeResponseMap } from '../../@types';

export type IntakeErrorMessage = string | IntakeResponses;
/**
 * @name IntakeError
 * @type { Error }
 * @extends UplinkGraphQLException
 * @description Standardizes the Intake Error Codes for consumption by consumers of the GraphQL Intake Endpoint `sendMessageFromWebApp`
 * @returns IntakeError{Error}
 */
export class IntakeError extends UplinkGraphQLException {
  constructor(message: IntakeErrorMessage, code: string) {
    super(message);
    this.code = code;
  }
}
