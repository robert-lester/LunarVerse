/* eslint-disable security/detect-object-injection */
// eslint-disable-next-line
const AWS = require('aws-sdk');
const https = require('https');
const Joi = require('joi');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const NosQL = require('../lib/nos-ql');

const AuthenticationException = require('./exceptions/AuthenticationException');
const ValidationException = require('./exceptions/ValidationException');

const TOKEN_EXPIRATION_MINUTES = 10;

const flatten = arrays => arrays.reduce((flatArray, array) => flatArray.concat(array), []);

const generateIamPolicy = (principalId, effect, resource) => ({
  principalId,
  policyDocument: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      },
    ],
  },
});

const formatPoolUser = user => ({
  username: user.Username,
  attributes: (user.Attributes || user.UserAttributes || []).reduce((obj, field) => {
    const output = obj;
    if (field.Value === 'true') {
      output[field.Name] = true;
    } else if (field.Value === 'false') {
      output[field.Name] = false;
    } else {
      output[field.Name] = field.Value;
    }

    return output;
  }, {}),
  created_at: user.UserCreateDate,
  updated_at: user.UserLastModifiedDate,
  enabled: user.Enabled,
  status: user.UserStatus,
});

const PEMS = {};

const validateToken = (userPoolId, token) => {
  const region = process.env.AWS_REGION ? process.env.AWS_REGION : 'us-east-1';
  // The URL for the Cognito issuer for the user pool
  const issuerURL = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  return new Promise((resolve, reject) => {
    // If we have the PEMs in the cache, resolve immediately
    if (PEMS[userPoolId]) {
      resolve(PEMS[userPoolId]);
      // Otherwise, we have to get the PEMs from AWS
    } else {
      PEMS[userPoolId] = {};

      https
        .get(`${issuerURL}/.well-known/jwks.json`, (res) => {
          if (res.statusCode > 299) {
            reject(new AuthenticationException());
          } else {
            let data = '';

            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              let body;

              try {
                body = JSON.parse(data);
              } catch (err) {
                // eslint-disable-next-line
                console.error(err);

                reject(new AuthenticationException());
              }

              if (!body.keys) {
                reject(new AuthenticationException());
              }

              // Create the PEMs
              body.keys.forEach((key) => {
                PEMS[userPoolId][key.kid] = jwkToPem({
                  kty: key.kty,
                  n: key.n,
                  e: key.e,
                });
              });

              resolve(PEMS[userPoolId]);
            });
          }
        })
        .on('error', reject);
    }
  }).then((userPoolPems) => {
    const decodedToken = jwt.decode(token, { complete: true });
    const currentUserPem = userPoolPems[decodedToken.header.kid];

    // Auto-expire tokens older than 10 minutes, even if they're valid according to AWS
    if (
      !(decodedToken.payload || {}).iat
      || Math.floor(new Date().getTime() / 1000) - decodedToken.payload.iat
      > TOKEN_EXPIRATION_MINUTES * 60
    ) {
      throw new AuthenticationException();
    }

    // Finally, verify the decoded token against the PEM and the supposed issuer
    return jwt.verify(token, currentUserPem, { issuer: issuerURL }).sub;
  });
};

/**
 * A controller for interfacing with the Lunar Authorization API
 * @alias module:AuthorizationController
 */
class AuthorizationController {
  /**
   * Create a new instance of the AuthorizationController
   */
  constructor() {
    const config = { region: 'us-east-1' };
    AWS.config.update(config);
    this.nosql = new NosQL(config);
    this.provider = new AWS.CognitoIdentityServiceProvider(config);
  }

  /**
   * Set the group permissions for a resource
   * @param {string} userPoolId The Cognito User Pool which the calling user belongs to
   * @param {string} resourceId The resource to set permissions for
   * @param {object} groupPermissions A map of which groups
   */
  set(userPoolId, resourceId, groupPermissions) {
    const finalGroupPermissions = groupPermissions;

    if (!Object.keys(groupPermissions).length) {
      finalGroupPermissions.public = true;
    }

    finalGroupPermissions.admin = true;

    this.nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.groups`, 'id');
    return this.nosql
      .batchRead(Object.keys(groupPermissions).map(groupName => `${userPoolId}:${groupName}`))
      .then(groups => groups.map((group) => {
        const updatedGroup = group;

        if (groupPermissions[group.name] === null) {
          delete updatedGroup.permissions[resourceId];
        } else {
          updatedGroup.permissions[resourceId] = groupPermissions[group.name];
        }

        return updatedGroup;
      }))
      .then(updatedGroups => this.nosql.batchWrite(updatedGroups).then(() => Promise.all(
        updatedGroups.map(group => this.provider
          .listUsersInGroup({
            GroupName: group.name,
            UserPoolId: userPoolId,
          })
          .promise()),
      )
        .then(results => results.map(result => result.Users))
        .then(flatten)
        .then((users) => {
          const uniqueUsernames = [];

          return users.filter((user) => {
            if (!uniqueUsernames.includes(user.Username)) {
              uniqueUsernames.push(user.Username);

              return true;
            }

            return false;
          });
        })
        .then(users => users.map(formatPoolUser))
        .then(uniqueUsers => this.refresh(
          userPoolId,
          uniqueUsers.map(user => user.attributes.email),
        ))));
  }

  refresh(userPoolId, userEmails, userNames) {
    // Get all of the current user table entries
    this.nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');
    return this.nosql.batchRead(userEmails.map(email => `${userPoolId}:${email}`)).then((users) => {
      const oldUserEmails = users.map(user => user.email);

      // If any of the users do not exist, add them to the list
      userEmails.forEach((email, idx) => {
        if (!oldUserEmails.includes(email)) {
          users.push({
            createdAt: Date.now(),
            email,
            name: userNames[idx],
            username: `${userPoolId}:${email}`,
            userPoolId,
          });
        }
      });
      // Get all of the groups associated with each of the users being updated
      return Promise.all(
        users.map(user => this.provider
          .adminListGroupsForUser({
            UserPoolId: userPoolId,
            Username: user.username,
          })
          .promise()
          .then(result => result.Groups.map(group => group.GroupName))),
      ).then((userGroupMaps) => {
        // Flatten the user groups into a single list of all unique groups
        const flatGroups = userGroupMaps.reduce((flattened, groupMap) => {
          groupMap.forEach((group) => {
            if (!flattened.includes(group)) {
              flattened.push(group);
            }
          });

          return flattened;
        }, []);

        // Get the normalized list of user groups
        this.nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.groups`, 'id');
        return this.nosql
          .batchRead(flatGroups.map(groupName => `${userPoolId}:${groupName}`))
          .then((groups) => {
            const newUsers = [];

            // Loop through the list of groups for each user
            for (let i = 0, l = userGroupMaps.length; i < l; i += 1) {
              const userGroups = userGroupMaps[i];
              const userGroupPerms = groups.filter(group => userGroups.includes(group.name));

              const flatPerms = userGroupPerms
                .map(group => group.permissions)
                .reduce((flatMap, groupPerm) => {
                  const newFlat = flatMap;

                  Object.keys(groupPerm).forEach((resourceId) => {
                    newFlat[resourceId] = newFlat[resourceId] || groupPerm[resourceId];
                  });

                  return newFlat;
                }, {});

              const resourcePerms = userGroupPerms.reduce((permMap, userGroup) => {
                const newPerms = permMap;

                Object.keys(userGroup.permissions).forEach((resourceId) => {
                  newPerms[resourceId] = newPerms[resourceId] || {};
                  newPerms[resourceId][userGroup.name] = userGroup.permissions[resourceId];
                });

                return newPerms;
              }, {});

              // Update the users with their new groups and a flattened set of the new
              // permissions associated with those groups
              newUsers.push(
                Object.assign({}, users[i], {
                  groups: userGroups,
                  permissions: flatPerms,
                  resources: resourcePerms,
                }),
              );
            }

            // Create/update the users in the table
            this.nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');
            return this.nosql.batchWrite(newUsers);
          });
      });
    });
  }
}

const decodeToken = token => jwt.decode(token, { complete: true });

const checkOrgPlan = async (namespace, organization) => {
  if (!namespace) {
    throw new ValidationException('Organization does not have access to this application');
  }
  const db = new NosQL({ region: 'us-east-1' });
  db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
  const org = await db.read(organization);

  // This is only used for programmatic authentication with Uplink through the uplinkPlan column
  if (!org[`${namespace}Plan`]) {
    throw new ValidationException('Organization does not have access to this application');
  }
  return true;
};

const cognitoAuthorizer = (event, context, callback) => {
  if (!event.authorizationToken || !event.authorizationToken.includes(':')) {
    callback('Unauthorized');
  } else {
    const [userPoolId, accessToken] = event.authorizationToken.split(':');

    validateToken(userPoolId, accessToken)
      .then(principalId => callback(null, generateIamPolicy(principalId, 'Allow', '*')))
      .catch((err) => {
        // eslint-disable-next-line
        console.error(err);
        callback('Unauthorized');
      });
  }
};

const cognitoAuthorizerWithCheck = (event, context, callback) => {
  const db = new NosQL({ region: 'us-east-1' });
  db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
  if (!event.authorizationToken || !event.authorizationToken.includes(':')) {
    callback('Unauthorized');
  } else {
    const [userPoolId, accessToken] = event.authorizationToken.split(':');
    db.scan('userPoolId', userPoolId).then((data) => {
      const row = data.Items[0];
      const organizationId = row.id;
      return organizationId;
    }).then(org => checkOrgPlan(context.functionName.split('-')[0], org))
      .then(() => validateToken(userPoolId, accessToken)
        .then(principalId => callback(null, generateIamPolicy(principalId, 'Allow', '*'))))
      .catch((err) => {
        // eslint-disable-next-line
        console.error(err);
        callback('Unauthorized');
      });
  }
};

/**
 * Returns an AWS Lambda Function authorizer aka custom authorizer
 * 
 * This authorizer is passed the value of a custom HTTP request header called 
 * Authorization. The value is passed into the function via the event object 
 * and authorizationToken property. The token is assumed to be a Basic auth
 * string in which the orgSlug and integration token value is base64 encoded.
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html
 * https://en.wikipedia.org/wiki/Basic_access_authentication
 * @param {*} integrationName The name of the authorizer function e.g. salesforce
 */
const createIntegrationAuthorizer = (integrationName = 'uplinkapi') => (event, context, callback) => {
  if (event.authorizationToken && event.authorizationToken.startsWith('Basic ')) {
    const encoded = event.authorizationToken.split(' ')[1];
    // TODO: Refactor to use the "basic-auth" lib
    const [orgSlug, integrationToken] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
    const db = new NosQL({ region: 'us-east-1' });
    db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

    console.info(`${integrationName} authorizer request with org ${orgSlug} and token ${integrationToken}`);

    checkOrgPlan(context.functionName.split('-')[0], orgSlug)
      .then(() => db.read(orgSlug)
        .then((org) => {
          if (!org.integrationTokens) {
            console.error(`${integrationName} authorizer failed because there are no integration tokens in org ${orgSlug}.`);
            callback('Unauthorized');
          } 

          // Iterate the set of tokens checking if the passed integration
          // token matches a token in the org
          const isValidToken = Object.keys(org.integrationTokens).some(key => {
            const token = org.integrationTokens[key];
            return token.value === integrationToken;
          });

          if (!isValidToken) {
            console.error(`${integrationName} authorizer failed because the request token is not a valid token in org ${orgSlug}.`);
            callback('Unauthorized');
          }

          callback(null, generateIamPolicy(integrationToken, 'Allow', '*'));
        }))
      .catch((err) => {
        // eslint-disable-next-line
        console.error(err);
        callback('Unauthorized');
      });
  } else {
    cognitoAuthorizerWithCheck(event, context, callback);
  }
};

/**
 * A module containing the AuthorizationController class
 * @module AuthorizationController
 */
module.exports = {
  AuthorizationController,
  cognitoAuthorizer,
  cognitoAuthorizerWithCheck,
  createIntegrationAuthorizer,
  groupPermissionsSchema: Joi.object()
    .pattern(/[a-z0-9-]{4,}/i, Joi.boolean().allow(null))
    .default({
      admin: true,
      public: true,
    }),
  getOrganizationFromToken(token, config = { region: 'us-east-1' }) {
    const db = new NosQL(config);
    db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

    if (!token) {
      throw new AuthenticationException();
    } else if (token.startsWith('Basic ')) {
      const encoded = token.split(' ')[1];
      // TODO: Refactor to use the "basic-auth" lib
      const [orgSlug] = Buffer.from(encoded, 'base64').toString('utf8').split(':');
      return orgSlug;
    }

    const decoded = decodeToken(token);
    const userPoolId = decoded.payload.username.split(':')[0];
    return db.scan('userPoolId', userPoolId).then((data) => {
      if (!data.Items.length) {
        throw new AuthenticationException();
      }
      const row = data.Items[0];
      const organizationId = row.id;
      return organizationId;
    });
  },
};
