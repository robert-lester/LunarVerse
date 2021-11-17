/* eslint-disable security/detect-object-injection */
const Joi = require('joi');
const NosQl = require('../../lib/nos-ql');
const { Controller, UserAuthorizerFactory } = require('../../lib/capsule/capsule');
const AuthenticationException = require('../exceptions/AuthenticationException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

/**
 * A controller for interfacing with the Lunar Users API
 * @alias module:UserController
 */
class UserController extends Controller {
  /**
   * Create a new instance of the UserController
   * @param {AuthorizationController} authController An instance of the AuthorizationController
   * @param {UserAuthorizerFactory} userAuthorizerFactory A user authorizer factory
   */
  constructor(authController) {
    super(['index']);

    this.provider = authController.provider;
    this.db = new NosQl();
    this.authController = authController;
    this.userAuthorizerFactory = new UserAuthorizerFactory();

    this.schema = {
      groupIndex: {
        groupName: Joi.string().required(),
      },
      read: {
        email: Joi.string().required(),
      },
      update: {
        email: Joi.string().required(),
        name: Joi.string().required(),
      },
      delete: {
        email: Joi.string().required(),
      },
      changePassword: {
        previousPassword: Joi.string().required(),
        proposedPassword: Joi.string().required(),
      },
      confirmPassword: {
        orgSlug: Joi.string().required(),
        confirmationCode: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
      },
    };
  }

  /**
   * Get all users for a given org
   * @returns {Promise} A Promise containing an array of users
   */
  index() {
    this.user.isAdmin();

    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');
    // Get the list of email addresses for all users that belong to the org
    return this.provider.listUsers({ UserPoolId: this.user.userPoolId }).promise()
      .then(results => results.Users.map(user => user.Username))
      // Use this list to return the full list of users
      .then(userEmails => this.db.batchRead(userEmails))
      .then(users => users.map(user => Object.assign(user, { id: user.email })))
      .catch((err) => {
        if (err.code === 'ResourceNotFoundException') {
          throw new AuthenticationException();
        } else {
          throw err;
        }
      });
  }

  /**
   * Get all users for a given group
   * @param {string} groupName The name of the group to read from
   * @returns {Promise} A Promise containing an array of users
   */
  groupIndex(groupName) {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');

    return this.provider.listUsersInGroup({
      GroupName: groupName,
      UserPoolId: this.user.userPoolId,
    }).promise()
      // Get the list of email addresses for all users that belong to the group
      .then(results => results.Users.map(user => user.Username))
      // Use this list to return the full list of users
      .then(usernames => this.db.batchRead(usernames))
      .then(users => users.map(user => Object.assign(user, { id: user.email })))
      .catch((err) => {
        if (err.code === 'ResourceNotFoundException') {
          if (err.message.includes('User pool')) {
            throw new AuthenticationException();
          } else {
            throw new ResourceNotFoundException('Group', groupName);
          }
        } else {
          throw err;
        }
      });
  }

  /**
   * Read a user
   * @param {string} email The email address of the user to read
   * @returns {Promise} A Promise containing the user
   */
  read(email) {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');
    return this.db.read(`${this.user.userPoolId}:${email}`)
      .then((user) => {
        if (!user) {
          throw new ResourceNotFoundException('User', email);
        } else {
          return Object.assign(user, { id: user.email });
        }
      });
  }

  /**
   * Update a user's name
   * @param {string} email The email address of the user to update
   * @param {string} name The new name for the user
   * @returns {Promise} A Promise containing the user
   */
  update(email, name) {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');
    const attributes = { name };

    return this.db.update(`${this.user.userPoolId}:${email}`, attributes)
      .then(() => this.read(email));
  }

  /**
   * Delete a user
   * @param {string} email The email address of the user to delete
   * @returns {Promise} An empty Promise
   */
  delete(email) {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.users`, 'username');

    return Promise.all([
      // Delete the Cognito user
      this.provider.adminDeleteUser({
        Username: `${this.user.userPoolId}:${email}`,
        UserPoolId: this.user.userPoolId,
      }).promise(),
      // Delete the user table entry
      this.db.delete(`${this.user.userPoolId}:${email}`),
    ])
      .then(() => '')
      .catch((err) => {
        if (err.code === 'ResourceNotFoundException') {
          // eslint-disable-next-line
          console.error(err);

          throw new AuthenticationException();
        } else if (err.code === 'UserNotFoundException') {
          throw new ResourceNotFoundException('User', email);
        } else {
          throw err;
        }
      });
  }

  /**
   * Change the password for a logged in user
   * @param {string} previousPassword The user's current password
   * @param {string} proposedPassword The password the user wishes to change to
   * @return {Promise} A Promise containing a confirmation string
   */
  changePassword(previousPassword, proposedPassword) {
    return this.provider.changePassword({
      AccessToken: this.user.accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: proposedPassword,
    }).promise()
      .then(() => 'Password changed successfully')
      .catch((err) => {
        throw err;
      });
  }

  /**
   * Confirm a password reset issued for a logged out user
   * @param {string} orgSlug The slug for the user's organization
   * @param {string} confirmationCode The code sent to the user's email
   * @param {string} email The user's email address
   * @param {string} password The password the user wishes to change to
   * @returns {Promise} A Promise containing a confirmation string
   */
  confirmPassword(orgSlug, confirmationCode, email, password) {
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
    return this.db.read(orgSlug)
      .then(org => this.provider.confirmForgotPassword({
        ClientId: org.userPoolClientId,
        ConfirmationCode: confirmationCode,
        Password: password,
        Username: `${org.userPoolId}:${email}`,
      }).promise())
      .then(() => '')
      .catch((err) => {
        if (err.code && err.code === 'ExpiredCodeException') {
          throw new AuthenticationException();
        } else {
          throw err;
        }
      });
  }
}

/**
 * A module containing the UserController class
 * @module UserController
 */
module.exports = UserController;
