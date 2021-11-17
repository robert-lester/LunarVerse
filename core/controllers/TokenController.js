// Polyfill for browser features that "amazon-cognito-idenity-js" uses
global.fetch = require('node-fetch');

global.navigator = () => null;

/* eslint-disable security/detect-object-injection */
// eslint-disable-next-line
const AWS = require('aws-sdk');
const https = require('https');
const Joi = require('joi');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const { AuthenticationDetails, CognitoUser, CognitoUserPool } = require('amazon-cognito-identity-js');
const NosQL = require('../../lib/nos-ql/');
const { Controller } = require('../../lib/capsule/capsule');

const AuthenticationException = require('../exceptions/AuthenticationException');
const DisabledUserException = require('../exceptions/DisabledUserException');

const MAX_LOGIN_ATTEMPTS = 5;

/**
 * A controller for interfacing with the Lunar Tokens API
 * @alias module:TokenController
 */
class TokenController extends Controller {
  /**
   * Create a new instance of the TokenController
   * @param {DynamoCRUD} orgTable A CRUD wrapper for the Lunar API organizations table
   * @param {CognitoIdentityServiceProvider} provider A Cognito Identity Service Provider
   */
  constructor() {
    super();

    // Keep a PEM cache so we don't have to do a lookup on subsequent container invocations
    this.pems = {};
    this.provider = new AWS.CognitoIdentityServiceProvider();

    this.db = new NosQL({ region: process.env.AWS_REGION || 'us-east-1' });

    this.schema = {
      issue: {
        credentials: {
          code: Joi.string(),
          orgSlug: Joi.string().required(),
          email: Joi.string().required(),
          password: Joi.string().required(),
          session: Joi.string(),
          initialPassword: Joi.string(),
        },
      },
      refresh: {
        orgSlug: Joi.string().required(),
        refreshToken: Joi.string().required(),
      },
      revoke: {
        token: Joi.string().required(),
      },
      validate: {
        userPoolId: Joi.string().required(),
        token: Joi.string().required(),
      },
      registerMFA: {
        credentials: {
          email: Joi.string().required(),
          orgSlug: Joi.string().required(),
          password: Joi.string().required(),
          phone: Joi.string().required(),
        },
      },
    };
  }

  getOrganization(orgSlug) {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

    return this.db.read(orgSlug);
  }

  static getUser(email, userPoolId, userPoolClientId) {
    return new CognitoUser({
      Username: `${userPoolId}:${email}`,
      Pool: new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: userPoolClientId,
      }),
    });
  }

  /**
   * Return a set of tokens for a user
   * @param {string} orgSlug The URL-safe slug for the user's organization
   * @param {string} email The user's email address
   * @param {string} password The user's password
   * @param {string} [initialPassword=''] The user's initial generated password (used during signup)
   * @returns {Promise} A Promise containing the user's identity, access, and refresh tokens
   */
  issue(credentials) {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.loginstats`, 'login');

    return this.db.read(`${credentials.orgSlug}:${credentials.email}`)
      .then(async (loginStats) => {
        let newLoginStats = loginStats;

        if (!loginStats) {
          newLoginStats = {
            attemptsSinceLastLockout: 0,
            createdAt: new Date().getTime(),
            failedLogins: 0,
            successfulLogins: 0,
            totalAttempts: 0,
          };
        } else {
          delete newLoginStats.login;
        }
        newLoginStats.totalAttempts += 1;

        const org = await this.getOrganization(credentials.orgSlug);
        this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.loginstats`, 'login');

        // Claimed organization does not exist in the system
        if (!org) {
          newLoginStats.attemptsSinceLastLockout += 1;

          this.db.update(`${credentials.orgSlug}:${credentials.email}`, newLoginStats);

          if (newLoginStats.attemptsSinceLastLockout >= MAX_LOGIN_ATTEMPTS) {
            throw new DisabledUserException();
          } else {
            throw new AuthenticationException(newLoginStats.attemptsSinceLastLockout);
          }
        }

        const { userPoolId } = org;
        const user = TokenController.getUser(credentials.email, userPoolId, org.userPoolClientId);

        if (credentials.session !== undefined) {
          user.Session = credentials.session;
        }

        return new Promise((resolve, reject) => {
          const callback = {
            // If this was the user's first login, they will have to reset their password
            newPasswordRequired: (userAttributes) => {
              const newUserAttributes = userAttributes;
              delete newUserAttributes.email_verified;
              delete newUserAttributes.phone_number_verified;
              // Since the initial generated password came over email, the email is now verified
              this.provider.adminUpdateUserAttributes({
                UserAttributes: [{
                  Name: 'email_verified',
                  Value: 'true',
                }],
                Username: `${userPoolId}:${credentials.email}`,
                UserPoolId: userPoolId,
              }).promise()
                // Then change the password to the one which the user chose
                .then(() => user
                  .completeNewPasswordChallenge(
                    credentials.password,
                    newUserAttributes,
                    callback,
                  ));
            },
            mfaRequired: () => {
              resolve({
                message: 'A verification code has been sent to your phone number',
                session: user.Session,
                status: 'MFARequired',
              });
            },
            onFailure: (err) => {
              if (err.code === 'MFAMethodNotFoundException') {
                resolve({
                  message: 'Multi-Factor Authentication is required by your organization but no method was found',
                  status: 'MFAMethodNotFound',
                });
              } else {
                // We have to log the error since it will be swallowed by the Lambda runtime
                // eslint-disable-next-line
                console.error(err);

                newLoginStats.attemptsSinceLastLockout += 1;
                newLoginStats.failedLogins += 1;

                this.db.update(`${credentials.orgSlug}:${credentials.email}`, newLoginStats);

                if (newLoginStats.attemptsSinceLastLockout >= MAX_LOGIN_ATTEMPTS) {
                  this.provider.adminDisableUser({
                    UserPoolId: userPoolId,
                    Username: `${userPoolId}:${credentials.email}`,
                  }, (disableUserErr) => {
                    if (disableUserErr) {
                      // eslint-disable-next-line
                      console.error(disableUserErr, disableUserErr.stack);
                    }
                  });

                  reject(new DisabledUserException());
                } else {
                  reject(new AuthenticationException(newLoginStats.attemptsSinceLastLockout));
                }
              }
            },
            onSuccess: (result) => {
              newLoginStats.attemptsSinceLastLockout = 0;
              newLoginStats.successfulLogins += 1;
              newLoginStats.lastSuccessfulLogin = new Date().getTime();

              this.db.update(`${credentials.orgSlug}:${credentials.email}`, newLoginStats)
                .then(() => {
                  resolve({
                    accessToken: `${userPoolId}:${result.getAccessToken().getJwtToken()}`,
                    refreshToken: result.getRefreshToken().token,
                    orgSlug: credentials.orgSlug,
                    orgTokens: Object.keys(org.integrationTokens || {}).reduce(
                      (acc, tokenName) => Object.assign({}, acc, {
                        [tokenName]: org.integrationTokens[tokenName].value,
                      }), {},
                    ),
                    status: 'LoggedIn',
                  });
                });
            },
          };

          if (credentials.code === undefined) {
            user.authenticateUser(new AuthenticationDetails({
              Username: credentials.email,
              // If there is an initial generated password, authenticate using that one first
              Password: credentials.initialPassword || credentials.password,
            }), callback);
          } else {
            user.sendMFACode(credentials.code, callback);
          }
        });
      });
  }

  registerMFA(credentials) {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
    return this.db.read(credentials.orgSlug)
      .then(org => this.provider.adminUpdateUserAttributes({
        UserAttributes: [
          {
            Name: 'phone_number',
            Value: credentials.phone,
          },
        ],
        UserPoolId: org.userPoolId,
        Username: `${org.userPoolId}:${credentials.email}`,
      }).promise()
        .then(() => this.provider.adminSetUserMFAPreference({
          UserPoolId: org.userPoolId,
          Username: `${org.userPoolId}:${credentials.email}`,
          SMSMfaSettings: {
            Enabled: true,
            PreferredMfa: true,
          },
        }).promise())
        .then(() => this.issue(credentials)));
  }

  /**
   * Issues a new access token to the user if their refresh token is valid
   * @param {string} orgSlug The URL-safe slug for the user's organization
   * @param {string} refreshToken A valid Cognito refresh token
   * @returns {Promise} A Promise containing a new access token
   */
  refresh(orgSlug, refreshToken) {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

    return this.db.read(orgSlug)
      .then((org) => {
        if (!org) {
          throw new AuthenticationException();
        }

        return this.provider.adminInitiateAuth({
          AuthFlow: 'REFRESH_TOKEN_AUTH',
          AuthParameters: {
            REFRESH_TOKEN: refreshToken,
          },
          ClientId: org.userPoolClientId,
          UserPoolId: org.userPoolId,
        }).promise()
          .then(result => ({
            accessToken: `${org.userPoolId}:${result.AuthenticationResult.AccessToken}`,
          }))
          .catch((err) => {
            // eslint-disable-next-line
            console.error(err.message);

            throw new AuthenticationException();
          });
      });
  }

  /**
   * Invalidate an user's access token (used for logging out a user)
   * @param {string} token A Lunar API user access token
   * @returns {Promise} An empty Promise
   */
  revoke(token) {
    return this.provider.globalSignOut({ AccessToken: token }).promise()
      .then(() => '')
      .catch((err) => {
        if (err.message === 'Access Token has been revoked') {
          return '';
        }
        throw err;
      });
  }

  /**
   * Validate that a token was issued by the Cognito User Pool which it claims it came from
   * @param {string} userPoolId The Cognito User Pool which the user claims to belong to
   * @param {string} token A Lunar API user access token
   * @returns {Promise} A Promise containing the user's unique Cognito User ID
   */
  validate(userPoolId, token) {
    // The URL for the Cognito issuer for the user pool
    const issuerURL = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${userPoolId}`;

    return new Promise((resolve, reject) => {
      // If we have the PEMs in the cache, resolve immediately
      if (this.pems[userPoolId]) {
        resolve(this.pems[userPoolId]);
      // Otherwise, we have to get the PEMs from AWS
      } else {
        this.pems[userPoolId] = {};

        https.get(`${issuerURL}/.well-known/jwks.json`, (res) => {
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

              throw new AuthenticationException();
            }

            if (!body.keys) {
              throw new AuthenticationException();
            }

            // Create the PEMs
            body.keys.forEach((key) => {
              this.pems[userPoolId][key.kid] = jwkToPem({
                kty: key.kty,
                n: key.n,
                e: key.e,
              });
            });

            resolve(this.pems[userPoolId]);
          });
        }).on('error', reject);
      }
    })
      .then((userPoolPems) => {
        const decodedToken = jwt.decode(token, { complete: true });
        const currentUserPem = userPoolPems[decodedToken.header.kid];

        // Finally, verify the decoded token against the PEM and the supposed issuer
        return jwt.verify(token, currentUserPem, { issuer: issuerURL }).sub;
      });
  }
}

/**
 * A module containing the TokenController class
 * @module TokenController
 */
module.exports = TokenController;
