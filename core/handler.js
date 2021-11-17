const bugsnag = require('bugsnag');

bugsnag.register('daa1390996daa66586566fcc3c6b55fe');

const lambda = require('../lib/lambda++');
const API = require('./core');
const { AuthorizationController, cognitoAuthorizer } = require('./auth');

// Controller dependencies
const authController = new AuthorizationController();

const user = new API.UserController(authController);
const group = new API.GroupController(authController);
const org = new API.OrganizationController(group, user, authController);
const token = new API.TokenController();

module.exports = {
  // Lambda authorizer
  cognitoAuthorizer,

  // Token methods
  loginUser(event, context, callback) {
    lambda.printEventInformation(event);
    const credentials = lambda.parseBody(event.body);
    credentials.email = (credentials.email || '').toLowerCase();

    token.issue(credentials)
      .then(res => lambda.responseCheckCORS(res, callback, event.headers))
      .catch(err => callback(null, {
        statusCode: err.statusCode,
        body: JSON.stringify(err),
        headers: {
          'Access-Control-Allow-Origin': '*',
          charset: 'utf-8',
          'content-type': 'application/json',
        },
      }));
  },
  refreshUser(event, context, callback) {
    lambda.printEventInformation(event);
    const { orgSlug, refreshToken } = lambda.parseBody(event.body);

    token.refresh(orgSlug, refreshToken)
      .then(res => lambda.responseCheckCORS(res, callback, event.headers))
      .catch(err => lambda.handleError(err, callback));
  },
  logoutUser(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);

    token.revoke(accessToken)
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },

  // Organization methods
  listOrgs(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);

    org.withUser(accessToken).then(() => org.index())
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  readOrg(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { orgSlug } = event.pathParameters;

    org.withUser(accessToken).then(() => org.read(orgSlug))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  deleteOrg(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { orgSlug } = event.pathParameters;

    org.withUser(accessToken).then(() => org.delete(orgSlug))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  // Group methods
  listGroups(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);

    group.withUser(accessToken).then(() => group.index())
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  createGroup(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { name, attributes } = lambda.parseBody(event.body);

    group.withUser(accessToken).then(() => group.create(name, attributes))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  readGroup(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { groupSlug } = event.pathParameters;

    group.withUser(accessToken).then(() => group.read(groupSlug))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  updateGroup(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { attributes } = lambda.parseBody(event.body);
    const { groupSlug } = event.pathParameters;

    group.withUser(accessToken).then(() => group.update(groupSlug, attributes))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  deleteGroup(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { groupSlug } = event.pathParameters;

    group.withUser(accessToken).then(() => group.delete(groupSlug))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  addUserToGroup(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { groupSlug, userEmail } = event.pathParameters;

    group.withUser(accessToken).then(() => group.addUser(groupSlug, decodeURIComponent(userEmail)))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  removeUserFromGroup(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { groupSlug, userEmail } = event.pathParameters;

    group.withUser(accessToken).then(() => group.removeUser(
      groupSlug,
      decodeURIComponent(userEmail),
    ))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },

  // User methods
  listUsers(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);

    user.withUser(accessToken).then(() => user.index())
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  listGroupUsers(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { groupSlug } = event.pathParameters;

    user.withUser(accessToken).then(() => user.groupIndex(groupSlug))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  readUser(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { userEmail } = event.pathParameters;

    user.withUser(accessToken).then(() => user.read(decodeURIComponent(userEmail)))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  updateUser(event, context, callback) {
    const attributes = lambda.parseBody(event.body);
    const accessToken = lambda.parseToken(event.headers);
    const { userEmail } = event.pathParameters;

    user.update(accessToken, decodeURIComponent(userEmail), attributes)
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  deleteUser(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { userEmail } = event.pathParameters;

    user.withUser(accessToken).then(() => user.delete(decodeURIComponent(userEmail)))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  changePassword(event, context, callback) {
    const accessToken = lambda.parseToken(event.headers);
    const { previousPassword, proposedPassword } = lambda.parseBody(event.body);

    user.withUser(accessToken).then(() => user.changePassword(previousPassword, proposedPassword))
      .then(res => lambda.response(res, callback))
      .catch(err => lambda.handleError(err, callback));
  },
  confirmPassword(event, context, callback) {
    lambda.printEventInformation(event);
    const {
      orgSlug,
      confirmationCode,
      email,
      password,
    } = lambda.parseBody(event.body);
    const formattedEmail = email.toLowerCase();

    user.confirmPassword(orgSlug, confirmationCode, formattedEmail, password)
      .then(res => lambda.responseCheckCORS(res, callback, event.headers, 204))
      .catch(err => lambda.handleError(err, callback));
  },
  registerMFA(event, context, callback) {
    lambda.printEventInformation(event);
    const credentials = lambda.parseBody(event.body);

    token.registerMFA(credentials)
      .then(res => lambda.responseCheckCORS(res, callback, event.headers))
      .catch(err => lambda.handleError(err, callback));
  },
};
