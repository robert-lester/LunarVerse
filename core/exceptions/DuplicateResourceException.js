const ResourceException = require('./ResourceException');

/**
 * An exception to be thrown when a resource that the user is trying to create already exists
 * @module DuplicateResourceException
 */
module.exports = class DuplicateResourceException extends ResourceException {
  /**
   * Create a new DuplicateResourceException
   * @param ...args Arguments for the parent class
   * @extends ResourceException
   */
  constructor(...args) {
    super(...args);

    this.message = `${this.resourceType} ${this.resourceName}already exists`;
    this.statusCode = 409;
  }
};
