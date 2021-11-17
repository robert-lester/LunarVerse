import * as crypto from 'crypto';
import * as Knex from 'knex';
import * as NosQl from '../../lib/nos-ql';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { AdminGetUserResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider';

import UserPoolService, { DEFAULT_USER_POOL_CLIENT_CONFIG } from '../lib/userPoolService';
import { PhoneNumberController } from '../../uplink/api/src/controllers/phoneNumber';
import UserLoginVerificationController from './UserLoginVerificationController';
import uplinkKnexfile from '../../uplink/api/src/database/knexfile';
import { authorizeSuperAdmin } from '../lib/authorizer';
import * as DuplicateResourceException from '../exceptions/DuplicateResourceException';
import * as ResourceNotFoundException from '../exceptions/ResourceNotFoundException';
import { slugify } from '../utils.js';
import { HTTPError } from '../../lib/lambda-context';
import {
  AdminCreateUser,
  AdminForgotPassword,
  UserAttributes,
  IOrgAttributes,
  IOrg,
  IUserData,
  DynamoDBUser,
  DynamoDBOrg,
  PollingIntervalUnits,
} from '../@types';
import { Organization, DEFAULT_CRM_INTEGRATION_VALUES } from '../../uplink/api/src/@types';
import { Applications } from '../lib/userPoolService';

const unique = (val, idx, arr) => arr.indexOf(val) === idx;
const IV_LENGTH = 16;
const algorithm = 'aes-256-cbc';

export default class AuthFlowController extends UserPoolService {
  /**
   * Create a new instance of the AuthFlowController
   * @param {AuthorizationController} authController An instance of the AuthorizationController
   */
  provider: CognitoIdentityServiceProvider;
  authController: any;
  db: any;
  userVerification: UserLoginVerificationController;

  static readonly DEFAULT_CRM_VALUES = {

  };

  constructor(authController) {
    super();

    this.provider = authController.provider;
    this.authController = authController;
    this.db = new NosQl();
    this.userVerification = new UserLoginVerificationController(this.authController);
  }

  /**
   * Get the org name and find the primary application, call createUser
   * @param {string} email The email address for the new user
   * @param {object} attributes A map of attributes to assign to the new user
   * @param {array} attributes.groups An array of group names to add the new user to
   * @param {string} attributes.name The name for the new user
   * @param {string} userPoolId The userPoolId of the user
   * @param {boolean} [resend=false] Whether the user invitation email should be resent
   * @returns {Promise} A Promise containing the new user
   */
  public async getOrgForUser(email: string, attributes: UserAttributes, userPoolId: string, resend: boolean = false): Promise<DynamoDBUser> {
    const org = await this.userVerification.getOrgByUserPoolId(userPoolId);

    let primaryApplication = Applications.SHUTTLE;

    if (org && org.uplinkPlan) {
      primaryApplication = Applications.UPLINK;
    }

    return this.createUser(email, attributes, userPoolId, org.name, resend, primaryApplication);
  }

  /**
   * Create a user. Create an encrypted "initial password"
   * @param {string} email The email address for the new user
   * @param {object} attributes A map of attributes to assign to the new user
   * @param {array} attributes.groups An array of group names to add the new user to
   * @param {string} attributes.name The name for the new user
   * @param {string} userPoolId The userPoolId of the user
   * @param {string} orgName The name of the organization associated to the user
   * @param {boolean} [resend=false] Whether the user invitation email should be resent
   * @param {string} primaryApplication The application (Uplink or Shuttle) associated with the users request
   * @returns {Promise} A Promise containing the new user
   */
  private async createUser(email: string, attributes: UserAttributes, userPoolId: string, orgName: string, resend: boolean = false, primaryApplication: Applications = Applications.SHUTTLE, updatePool: boolean = true): Promise<DynamoDBUser> {
    // There is some controversy surrounding lowercasing of email addresses:
    // https://ux.stackexchange.com/questions/16848/if-your-login-is-an-email-should-you-canonicalize-lower-case-it
    // In this case, mixed case email addresses were causing a problem
    // authenticating users.
    if (typeof email !== 'string') {
      throw new TypeError('Email must be a string');
    }
    email = email.toLowerCase();

    // Generate encrypted token
    const orgSlug = slugify(orgName);
    const token: string = await this.encryptUserData(`${attributes.name}:${orgSlug}:${email}`);
    const username = `${userPoolId}:${email}`;

    const userConfig: AdminCreateUser = {
      TemporaryPassword: token,
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: [{
        Name: 'email',
        Value: email,
      }],
    };

    // All users belong to the public group
    attributes.groups.push('public');

    if (resend) {
      userConfig.MessageAction = 'RESEND';
    }

    updatePool && await this.updateUserPool(userPoolId, primaryApplication, orgName, '');
    // Create the Cognito user
    return this.provider.adminCreateUser(userConfig).promise()
      // Add the user to each of the listed groups
      .then(() => Promise.all(attributes.groups
        .filter(unique).map(group => this.provider.adminAddUserToGroup({
          GroupName: group,
          UserPoolId: userPoolId,
          Username: username,
        }).promise())))
      // Build the user's initial permissions
      .then(() => this.authController.refresh(userPoolId, [email], [attributes.name]))
      .then(() => this.readUser(email, userPoolId))
      .catch((err) => {
        if (err.code === 'UsernameExistsException') {
          throw new DuplicateResourceException('User', email);
        } else {
          throw err;
        }
      });
  }

  /**
   * Read a user
   * @param {string} email The email address of the user to read
   * @param {string} userPoolId the user pool of the admin
   * @returns {Promise} A Promise containing the user
   */
  private readUser(email: string, userPoolId: string): Promise<DynamoDBUser> {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');
    return this.db.read(`${userPoolId}:${email}`)
      .then((user) => {
        if (!user) {
          throw new ResourceNotFoundException('User', email);
        } else {
          return Object.assign({}, user, { id: user.email });
        }
      });
  }

  /**
   * Encrypts the users data into a base 64 string
   * @param {string} text the user data that needs to be encrypted
   */
  private encryptUserData(text: string): string {
    // Create random bytes for iv
    const iv: Buffer = crypto.randomBytes(IV_LENGTH);
    // Create a cipher iv instance
    const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, new Buffer(process.env.CRYPTO_SECRET_KEY), iv);
    // Encrypt new users data
    // TODO: Fix the Buffer typings to allow for strings in this call.
    let encrypted: Buffer = cipher.update(text as any);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // Return token with the iv and encrypted token together
    return iv.toString('base64') + ':' + encrypted.toString('base64');
  }

   /**
   * Decrypts a cipher token
   * @param {string} cipherToken encrypted token
   * @returns {IUserData} An object of the users name, email, and org
   */
  public async decryptUserData(cipherToken: string): Promise<IUserData> {
    // Split the iv and the token out of the cipherToken
    const [iv, token] = cipherToken.split(':');

    if (!iv || !token) {
      throw new HTTPError(400, 'Invalid Token');
    }
    // Create Buffers
    const ivBuffer = new Buffer(iv, 'base64');
    const encryptedToken = new Buffer(token, 'base64');
    // Decrypt Token
    const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, new Buffer(process.env.CRYPTO_SECRET_KEY), ivBuffer);
    const decrypted: Buffer = decipher.update(encryptedToken);
    // Turn Buffer token into a string
    const decryptedToken: string = Buffer.concat([decrypted, decipher.final()]).toString();
    // Parse out the variables
    const [name, orgSlug, ...splitEmail] = decryptedToken.split(':');

    if (!name || !orgSlug || splitEmail.length === 0) {
      throw new HTTPError(400, 'Invalid Token');
    }
    const email = splitEmail.join(':');

    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
    const org: DynamoDBOrg = await this.db.read(slugify(orgSlug));
    // Verify org
    if (!org) {
      throw new HTTPError(401, 'Organization does not exist');
    } else if (typeof org.disabled === 'boolean' && org.disabled === true) {
      throw new HTTPError(401);
    }

    const username = `${org.userPoolId}:${email}`;
    // Verify user and invitation
    await this.provider.adminGetUser({
      UserPoolId: org.userPoolId,
      Username: username,
    })
      .promise()
      .then((res: AdminGetUserResponse) => {
        const userTimestamp = res.UserCreateDate.getTime();
        const sevenDaysFromNow = new Date().getTime() - (168 * 60 * 60 * 1000);

        if (res.Enabled === false || sevenDaysFromNow > userTimestamp) {
          throw new HTTPError(400, 'User is disabled');
        }
        if (res.UserStatus !== 'FORCE_CHANGE_PASSWORD') {
          throw new HTTPError(400, 'Invitation has already been used');
        }
      })
      .catch((err) => {
        if (err) throw err;
      });

    return {
      name,
      orgSlug,
      email,
    };
  }

  /**
   * Create an org
   * @param {string} name The name of the new org
   * @param {array} admins An array of admins to add to the org
   * @param {object} attributes A name/value list of attributes to add to the org
   * @param {boolean} attributes.mfaRequired Whether MFA is required for all users of the org
   * @returns {Promise} A Promise containing the new org
   */
  async createOrg(name, admins, attributes: IOrgAttributes, fromZuora, adminUserPoolId: string): Promise<IOrg> {
    const orgName = name;

    if (!fromZuora) {
      await authorizeSuperAdmin(adminUserPoolId);
    }
    const slug = slugify(name);
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

    // If this is truthy, an organization already exists with the derived slug
    if (await this.db.read(slug)) {
      throw new DuplicateResourceException('Organization', slug);
    }
    console.log('No duplicates found. Creating user pool for organization...');

    let primaryApplication = Applications.SHUTTLE;

    if (attributes.primaryApplication === 'Uplink') {
      primaryApplication = Applications.UPLINK;
    }

    const userPoolConfig = await this.createUserPool(slug, primaryApplication, attributes.mfaRequired);
    const userPoolId: string = userPoolConfig.UserPool.Id;

    try {
      console.log('User pool created. Creating user pool client...');

      const userPoolClientConfig = await this.provider.createUserPoolClient(Object.assign(
        {},
        DEFAULT_USER_POOL_CLIENT_CONFIG,
        {
          UserPoolId: userPoolId,
        },
      )).promise();
      const userPoolClientId = userPoolClientConfig.UserPoolClient.ClientId;

      console.log('User pool client created. Creating default user groups...');

      this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.groups`, 'id');

      await Promise.all(['admin', 'public'].map(groupName => Promise.all([
        this.provider.createGroup({
          GroupName: groupName,
          UserPoolId: userPoolId,
        }).promise(),
        this.db.create(`${userPoolId}:${groupName}`, {
          name: groupName,
          permissions: {},
          slug: groupName,
        }),
      ])));
      console.log('Default user groups created. Creating admin user(s)...');
      await this.createUser(process.env.SUCCESS_USER_EMAIL,
        { name: process.env.SUCCESS_USER_NAME,
          groups: ['admin', 'public'],
        },
        userPoolId,
        orgName,
        false,
        primaryApplication,
      );

      await Promise.all(admins.map(async (admin) => {
        await this.createUser(admin.email,
          { name: admin.name,
            groups: ['admin', 'public'],
          },
          userPoolId,
          orgName,
          false,
          primaryApplication,
          false,
        );
      }));

      this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

      const org: any = {
        integrationTokens: {},
        uplinkPlan: null,
        name,
        shuttlePlan: null,
        userPoolId: userPoolId,
        userPoolClientId,
      };

      if (attributes.primaryApplication === 'Uplink') {
        console.log('Admin user created. Purchasing Uplink user phone numbers...');

        org.integrationTokens = {
          salesforce: {
            value: crypto.randomBytes(16).toString('hex'),
          },
          smartAdvocate: {
            value: crypto.randomBytes(16).toString('hex'),
          },
          genericCRM: {
            value: crypto.randomBytes(16).toString('hex'),
          },
        };
        org.uplinkPlan = attributes.uplinkPlan;
        org.uplinkSalesforceIntegration = DEFAULT_CRM_INTEGRATION_VALUES;
        org.smartAdvocateIntegration =  DEFAULT_CRM_INTEGRATION_VALUES;
        org.genericCRMIntegration =  DEFAULT_CRM_INTEGRATION_VALUES;
        // TODO: Make the billingCycle and displayName dynamic from Zuora
        org.uplinkPlan.billingCycle = 'annually';
        org.uplinkPlan.displayName = 'Standard Plan';
        org.zuora = attributes.zuora;
        org.mobileSync = true;

        const phoneController = new PhoneNumberController(Knex(uplinkKnexfile));
        const purchasePhoneNumberOptions: any = {
          amount: attributes.uplinkUserNumbers,
          organization_id: slug,
          type: 'UNASSIGNED',
        };

        if (attributes.uplinkUserNumberAreaCode !== undefined) {
          purchasePhoneNumberOptions.options = {
            area_code: attributes.uplinkUserNumberAreaCode,
          };
        }
        await phoneController.batchCreate(purchasePhoneNumberOptions);
        phoneController.connection.destroy(() => {
          console.log('Uplink database connection disposed');
        });

        console.log('Phone numbers purchased. Saving org to table...');
      } else {
        console.log('Admin user(s) created. Saving org to table...');
      }
      return this.db.create(slug, org);
    } catch (err) {
      await this.provider.deleteUserPool({ UserPoolId: userPoolId }).promise();
      throw err;
    }
  }

  /**
   * Update an org
   * @param {string} userPoolId The user pool ID is used to fetch the org information
   * @returns {Promise} A Promise containing the org
   */
  async updateOrg(userPoolId: string): Promise<DynamoDBOrg | Organization > {
    // At the moment, this method is intended only to backfill integration 
    // values in the org
    const org = await this.userVerification.getOrgByUserPoolId(userPoolId);

    if (org && !org.uplinkPlan) {
      return org;
    }

    let uplinkOrg: Organization = org;
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

    if (! uplinkOrg.uplinkSalesforceIntegration) {
      await this.db.update(`${uplinkOrg.id}`, {
        uplinkSalesforceIntegration: DEFAULT_CRM_INTEGRATION_VALUES,
      });
    }

    if (! uplinkOrg.smartAdvocateIntegration) {
      await this.db.update(`${uplinkOrg.id}`, {
        smartAdvocateIntegration : DEFAULT_CRM_INTEGRATION_VALUES,
      });
    } 

    if (! uplinkOrg.genericCRMIntegration) {
      await this.db.update(`${uplinkOrg.id}`, {
        genericCRMIntegration: DEFAULT_CRM_INTEGRATION_VALUES,
      });
    }

    if (! uplinkOrg.integrationTokens.salesforce) {
      uplinkOrg = await this.db.update(`${uplinkOrg.id}`, {
        integrationTokens : Object.assign({}, uplinkOrg.integrationTokens, {
          salesforce : {
            value: crypto.randomBytes(16).toString('hex')
          }
        })
      });
    }
    
    if (! uplinkOrg.integrationTokens.genericCRM) {
      uplinkOrg = await this.db.update(`${uplinkOrg.id}`, {
        integrationTokens : Object.assign({}, uplinkOrg.integrationTokens, {
          genericCRM : {
            value: crypto.randomBytes(16).toString('hex')
          }
        })
      });
    }

    if (! uplinkOrg.integrationTokens.smartAdvocate) {
      uplinkOrg = await this.db.update(`${uplinkOrg.id}`, {
        integrationTokens : Object.assign({}, uplinkOrg.integrationTokens, {
          smartAdvocate : {
            value: crypto.randomBytes(16).toString('hex')
          }
        })
      });
    }

    if (! uplinkOrg.mobileSync) {
      uplinkOrg = await this.db.update(`${uplinkOrg.id}`, {
        mobileSync: true
      });
    }

    return await this.db.read(uplinkOrg.id);
  }

  /**
   * Send a password reset email for a logged out user
   * @param {string} orgSlug The slug for the user's organization
   * @param {string} email The user's email address
   * @returns {Promise} An empty Promise
   */
  public async forgotPassword(orgSlug: string, email: string) {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
    this.db.read(orgSlug)
      .then(async (org: DynamoDBOrg) => {
        if (!org) {
          throw new ResourceNotFoundException('Organization', orgSlug);
        } else {
          const forgotPasswordRequest: AdminForgotPassword = {
            ClientId: org.userPoolClientId,
            Username: `${org.userPoolId}:${email}`,
          }

          let primaryApplication = Applications.SHUTTLE;
          if (org && org.uplinkPlan) {
            primaryApplication = Applications.UPLINK;
          }

          const user: DynamoDBUser = await this.readUser(email, org.userPoolId);

          if (user && typeof user.name === 'string') {
            // Update email template
            await this.updateUserPool(org.userPoolId, primaryApplication, org.name, '');
  
            return this.provider.forgotPassword(forgotPasswordRequest)
              .promise()
              .catch((err) => {
                if (err.code === 'NotAuthorizedException') {
                  // eslint-disable-next-line
                  console.log('User has not been confirmed. Attempting to send new confirmation...');
  
                  // Create User if they do not actually exist
                  this.createUser(email, {
                    groups: [],
                    name: '',
                  },
                  org.userPoolId,
                  orgSlug,
                  true,
                  primaryApplication,
                  )
                    .then(() => {
                      // eslint-disable-next-line
                      console.log('New confirmation message successfully sent!');
                    })
                    .catch((err2) => {
                      // eslint-disable-next-line
                      console.error('Failed to confirm user', err2);
                    });
                } else {
                  // eslint-disable-next-line
                  console.error(err);
                }
              });
          } else {
            console.log('User not found');
          }
        }
      })
      .catch((err) => {
        // eslint-disable-next-line
        console.error(err);
      });

    // Ensure the method always takes the same time to run and returns the same response
    // This prevents attackers from determining if a user exists in the system
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 3000);
    });
  }
}
