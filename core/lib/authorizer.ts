import * as AuthorizationException from '../../lib/capsule/src/exceptions/AuthorizationException';

// Authorize the the User that made the request
// Get the access token and parse out the userPoolId
export const authorizeToken = (event): string => {
  const { Authorization } = event.headers;
  if (!Authorization) {
    throw new Error('No Authorization Header');
  }

  const accessToken: string|boolean = typeof Authorization === 'string' ? Authorization : false;
  if (!accessToken) {
    throw new Error('Unauthorized');
  }

  const userPoolId = accessToken.split(':')[0];
  if (!userPoolId) {
    throw new Error('Unauthorized');
  }

  return userPoolId;
}

export const authorizeSuperAdmin = (userPoolId): void => {
  if (userPoolId !== process.env.SUPER_ADMIN_POOL) {
    throw new AuthorizationException();
  }
}