/**
 * @module AuthorizationException
 */
module.exports = class AuthorizationException extends Error {
  /**
   * Create a new AuthorizationException
   * @param {string} message The message that should be returned to the API user
   * @extends Error
   */
  constructor(message = 'Unauthorized') {
    super();

    this.message = message;
    this.statusCode = 403;
  }
};
