/* eslint-disable security/detect-object-injection,no-console */
const AWS = require('aws-sdk');
const Joi = require('joi');
const NosQL = require('../../lib/nos-ql');
const { Controller, UserAuthorizerFactory } = require('../../lib/capsule/capsule');
const AuthenticationException = require('../exceptions/AuthenticationException');
const DuplicateResourceException = require('../exceptions/DuplicateResourceException');
const ValidationException = require('../exceptions/ValidationException');
const ResourceNotFoundException = require('../exceptions/ResourceNotFoundException');

const { formatPoolUser, slugify } = require('../utils');

const RESOURCE_ID_REGEX = /^[0-9a-z:-]{4,}$/i;

/**
 * A controller for interfacing with the Lunar Groups API
 * @alias module:GroupController
 */
class GroupController extends Controller {
  /**
   * Create a new instance of the GroupController
   * @param {AuthorizationController} authController An instance of the AuthorizationController
   * @param {UserAuthorizerFactory} userAuthorizerFactory A user authorizer factory
   */
  constructor(authController) {
    super(['index']);

    this.authController = authController;
    this.provider = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });
    this.userAuthorizerFactory = new UserAuthorizerFactory();

    this.db = new NosQL({ region: 'us-east-1' });

    this.schema = {
      create: {
        name: Joi.string().required(),
        attributes: Joi.object().keys({
          permissions: Joi.object().pattern(RESOURCE_ID_REGEX, Joi.boolean().allow(null)),
        }).default({ permissions: {} }),
      },
      read: {
        name: Joi.string().required(),
      },
      update: {
        name: Joi.string().required(),
        attributes: Joi.object().keys({
          permissions: Joi.object().pattern(RESOURCE_ID_REGEX, Joi.boolean().allow(null)),
        }).required().or('permissions'),
      },
      delete: {
        name: Joi.string().required(),
      },
      addUser: {
        name: Joi.string().required(),
        userEmail: Joi.string().email().required(),
      },
      removeUser: {
        name: Joi.string().required(),
        userEmail: Joi.string().email().required(),
      },
    };
  }

  /**
   * Get all groups for a given org
   * @returns {Promise} A Promise containing an array of groups
   */
  index() {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.groups`, 'id');

    return this.provider.listGroups({
      UserPoolId: this.user.userPoolId,
    }).promise()
      .then(res => res.Groups.map(group => `${this.user.userPoolId}:${slugify(group.GroupName)}`))
      .then(groupIds => this.db.batchRead(groupIds))
      .catch((err) => {
        if (err.code === 'ResourceNotFoundException') {
          console.error(err);

          throw new AuthenticationException();
        } else {
          throw err;
        }
      });
  }

  /**
   * Create a group
   * @param {string} name The name of the new group
   * @param {object} attributes A map of attributes to assign to the new group
   * @param {object} [attributes.permissions={}] A map of permissions for the new group
   * @returns {Promise} A Promise containing the new group
   */
  create(name, attributes) {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.groups`, 'id');

    const slug = slugify(name);
    // Create the new group in Cognito
    return this.provider.createGroup({
      GroupName: slug,
      UserPoolId: this.user.userPoolId,
    }).promise()
      // Create a new group table entry
      .then(() => this.db.create(`${this.user.userPoolId}:${slug}`, {
        name,
        permissions: Object.keys(attributes.permissions)
          .reduce((permMap, resourceId) => {
            const newPermMap = permMap;

            // For future JSON merges, we cannot allow null keys
            if (attributes.permissions[resourceId] !== null) {
              newPermMap[resourceId] = attributes.permissions[resourceId];
            }

            return newPermMap;
          }, {}),
        slug,
      }))
      .catch((err) => {
        console.error(err);
        if (err.code === 'ResourceNotFoundException') {
          console.error(err);

          throw new AuthenticationException();
        } else if (err.code === 'GroupExistsException') {
          throw new DuplicateResourceException('Group', name);
        } else if (err.code === 'InvalidParameterException') {
          throw new ValidationException(err);
        } else {
          throw err;
        }
      });
  }

  /**
   * Read a group
   * @param {string} name The name of the group to read
   * @returns {Promise} A Promise containing the group
   */
  read(name) {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.groups`, 'id');

    return this.db.read(`${this.user.userPoolId}:${slugify(name)}`)
      .then((group) => {
        if (!group) {
          throw new ResourceNotFoundException('Group', name);
        }

        return group;
      });
  }

  /**
   * Update a group and rebuild the permissions for any affected users
   * @param {string} name The name of the group to update
   * @param {object} attributes A map of attributes to update on the group
   * @param {object} [attributes.permissions={}] A map of permissions to update on the group
   * @returns {Promise} A Promise containing the updated group
   */
  update(name, attributes) {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.groups`, 'id');

    // The admin group is given write permission to all resources automatically
    if (name === 'admin') {
      throw new ValidationException('The admin group cannot be updated');
    }

    return this.read(name)
      .then((group) => {
        // Overwrite existing group permissions with new ones
        const mergedPerms = Object.assign(group.permissions, attributes.permissions);

        return Object.keys(mergedPerms)
          // Filter out null keys (remove these permissions from the group)
          .filter(resourceId => mergedPerms[resourceId] !== null)
          // Build the new permissions map
          .reduce((permMap, resourceId) => {
            const newPerms = permMap;

            newPerms[resourceId] = mergedPerms[resourceId];

            return newPerms;
          }, {});
      })
      // Update the group with the new permissions
      .then(newPerms => this.db.update(`${this.user.userPoolId}:${slugify(name)}`, { permissions: newPerms }))
      // Get the list of email addresses for all users that belong to the group
      .then(updatedGroup => this.provider.listUsersInGroup({
        GroupName: name,
        UserPoolId: this.user.userPoolId,
      }).promise()
        .then(results => results.Users.map(formatPoolUser).map(user => user.attributes.email))
        // Rebuild the permissions for all users that belong to the updated group
        .then(userEmails => this.authController.refresh(this.user.userPoolId, userEmails))
        .then(() => updatedGroup));
  }

  /**
   * Delete a group and rebuild the permissions for any affected users
   * @param {string} name The name of the group to delete
   * @returns {Promise} An empty Promise
   */
  delete(name) {
    this.user.isAdmin();
    this.db.setTable(`${process.env.API_RESOURCE_PREFIX}.groups`, 'id');

    if (['admin', 'public'].includes(name)) {
      throw new ValidationException('Built-in groups cannot be deleted');
    }

    // Get the list of email addresses for all users that belong to the group
    return this.provider.listUsersInGroup({
      GroupName: name,
      UserPoolId: this.user.userPoolId,
    }).promise()
      .then(results => results.Users.map(formatPoolUser).map(user => user.attributes.email))
      .then(userEmails => Promise.all([
        this.provider.deleteGroup({
          GroupName: name,
          UserPoolId: this.user.userPoolId,
        }).promise(),
        this.db.delete(`${this.user.userPoolId}:${slugify(name)}`),
      ])
        .then(() => this.authController.refresh(this.user.userPoolId, userEmails)))
      .then(usersAffected => ({
        message: `Group "${name}" successfully deleted`,
        usersAffected,
      }))
      .catch((err) => {
        if (err.code === 'ResourceNotFoundException') {
          if (err.message.includes('User pool')) {
            console.error(err);

            throw new AuthenticationException();
          } else {
            throw new ResourceNotFoundException('Group', name);
          }
        } else {
          throw err;
        }
      });
  }

  /**
   * Add a user to a group and rebuild that user's permissions
   * @param {string} name The name of the group to add the user to
   * @param {string} userEmail The email address for the user being added
   * @returns {Promise} An empty Promise
   */
  addUser(name, userEmail) {
    this.user.isAdmin();

    // Add the user to the Cognito user group
    return this.provider.adminAddUserToGroup({
      GroupName: name,
      UserPoolId: this.user.userPoolId,
      Username: `${this.user.userPoolId}:${userEmail}`,
    }).promise()
      // Rebuild the user's permissions
      .then(() => this.authController.refresh(this.user.userPoolId, [userEmail]))
      .then(() => `User "${userEmail}" has been added to group "${name}"`)
      .catch((err) => {
        if (err.code === 'ResourceNotFoundException') {
          if (err.message.includes('User pool')) {
            console.error(err);

            throw new AuthenticationException();
          } else {
            throw new ResourceNotFoundException('Group', name);
          }
        } else {
          throw err;
        }
      });
  }

  /**
   * Remove a user from a group and rebuild that user's permissions
   * @param {string} name The name of the group to remove the user from
   * @param {string} userEmail The email address for the user being removed
   * @returns {Promise} An empty Promise
   */
  removeUser(name, userEmail) {
    this.user.isAdmin();

    // Remove the user from the Cognito user group
    return this.provider.adminRemoveUserFromGroup({
      GroupName: name,
      UserPoolId: this.user.userPoolId,
      Username: `${this.user.userPoolId}:${userEmail}`,
    }).promise()
      // Rebuild the user's permissions
      .then(() => this.authController.refresh(this.user.userPoolId, [userEmail]))
      .then(() => `User "${userEmail}" has been removed from group "${name}"`)
      .catch((err) => {
        if (err.code === 'ResourceNotFoundException') {
          if (err.message.includes('User pool')) {
            console.error(err);

            throw new AuthenticationException();
          } else {
            throw new ResourceNotFoundException('Group', name);
          }
        } else {
          throw err;
        }
      });
  }
}

/**
 * A module containing the GroupController class
 * @module TokenController
 */
module.exports = GroupController;
