const ResourceException = require('./ResourceException');

/**
 * An exception to be thrown when the user tries to access a resource that doesn't exist
 * @module ResourceNotFoundException
 */
module.exports = class ResourceNotFoundException extends ResourceException {
  /**
   * Create a new ResourceNotFoundException
   * @param ...args Arguments for the parent class
   * @extends ResourceException
   */
  constructor(...args) {
    super(...args);

    this.message = `${this.resourceType} ${this.resourceName}not found`;
    this.statusCode = 404;
  }
};
