class ValidationException extends Error {
  /**
   * Create a new ValidationException
   * @param {string} message The message that should be returned to the API user
   * @extends Error
   */
  constructor(message) {
    super();

    this.message = message;
    this.statusCode = 400;
  }
}

/**
 * An exception to be thrown when input to a business logic element is invalid
 * @module ValidationException
 */
module.exports = ValidationException;
