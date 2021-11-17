import { UplinkGraphQLException } from './UplinkGraphQLException';

export class ResourceNotFound extends UplinkGraphQLException {
  code = 'RESOURCE_NOT_FOUND';
  message = this.message || 'The requested resource could not be found';
}