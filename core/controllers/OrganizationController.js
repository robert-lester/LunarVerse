/* eslint-disable no-console,security/detect-object-injection */
const crypto = require('crypto');
// eslint-disable-next-line
const AWS = require('aws-sdk'); // AWS SDK is included in the Lambda runtime by default
const Joi = require('joi');
const NosQL = require('../../lib/nos-ql');
const { Controller, UserAuthorizerFactory } = require('../../lib/capsule/capsule');
const DuplicateResourceException = require('../exceptions/DuplicateResourceException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');
const ValidationException = require('../exceptions/ValidationException');
/**
 * A controller for interfacing with the Lunar Organizations API
 * @alias module:OrganizationController
 */
class OrganizationController extends Controller {
  /**
   * Create a new instance of the OrganizationController
   * @param {GroupController} group An instance of the GroupController
   * @param {UserController} user An instance of the UserController
   * @param {AuthController} auth An instance of the AuthController
   */
  constructor(group, user, auth) {
    super(['index']);

    this.controllers = { auth, group, user };

    this.provider = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });
    this.userAuthorizerFactory = new UserAuthorizerFactory();
    this.nosql = new NosQL();

    this.schema = {
      read: {
        slug: Joi.string().required(),
      },
      delete: {
        slug: Joi.string().required(),
      },
    };
  }

  /**
   * List all orgs
   * @returns {Promise} A Promise containing an array of orgs
   */
  index() {
    this.user.isSuperAdmin();

    this.nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
    return this.nosql.index();
  }

  /**
   * Read an org
   * @param {string} slug The slug of the org to read
   * @returns {Promise} A Promise containing the org
   */
  async read(slug) {
    this.user.isAdmin();
    this.nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

    const org = await this.nosql.read(slug);

    if (!org) {
      throw new ResourceNotFoundException('Organization', slug);
    }

    const userActivity = await this.getUserActivity(slug, org.userPoolId);
    org.userActivity = userActivity;

    return org;
  }

  /**
   * Delete an org
   * @param {string} slug The slug of the org to delete
   * @returns {Promise} An empty Promise
   */
  delete(slug) {
    this.user.isSuperAdmin();

    return this.read(slug)
      .then(org => Promise.all([
        this.provider.deleteUserPool({ UserPoolId: org.userPoolId }).promise(),
        this.nosql.delete(slug),
      ]))
      .then(() => '');
  }

  /**
   * Builds a list of users for an org with their user activity
   * @param {string} slug The slug of the org to lookup
   * @param {string} userPoolId The User Pool Id to lookup users
   * @returns {Array} List of users with the appropriate user activity data
   */
  async getUserActivity(slug, userPoolId) {
    this.nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.loginstats`, 'login');

    const usersEmailList = await this.provider.listUsers({ UserPoolId: userPoolId }).promise()
      .then(results => results.Users.map(user => user.Username.split(':').slice(1).join(':')));

    const usersList = await this.nosql.index();
    const filterUsers = usersList.filter(user => user.login.split(':')[0] === slug
      && usersEmailList.indexOf(user.login.split(':')[1]) > -1);

    return filterUsers.map(user => ({
      email: user.login.split(':')[1],
      loginCount: user.successfulLogins,
      lastLoginAt: user.lastSuccessfulLogin || null,
    }));
  }
}

/**
 * A module containing the OrganizationController class
 * @module OrganizationController
 */
module.exports = OrganizationController;
