/**
 * An exception when the cognito user is disabled
 * @module DisabledUserException
 */
module.exports = class DisabledUserException extends Error {
  /**
   * Create a new DisabledUserException
   * @param ...args Arguments for the parent class
   * @extends Error
   */
  constructor(...args) {
    super(...args);

    this.message = 'User Disabled. Please contact your administrator to re-enable your user';
    this.statusCode = 423; // ???
  }
};
