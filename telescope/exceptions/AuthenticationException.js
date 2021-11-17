/**
 * An exception to be thrown when a user is not authorized to access a resource
 * @module AuthenticationException
 */
module.exports = class AuthenticationException extends Error {
  /**
   * Create a new AuthenticationException
   * @param ...args Arguments for the parent class
   * @extends Error
   */
  constructor(count) {
    super();

    this.message = 'Unauthorized';
    this.attempts_remaining = 5 - count;
    this.statusCode = 401;
  }
};
