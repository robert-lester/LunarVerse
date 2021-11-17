class ResourceException extends Error {
  /**
   * Create a new ResourceException
   * @param {string} [resourceType='Resource'] The type of the resource
   * @param {string} [resourceName=''] The name of the resource
   * @param ...args Arguments for the parent class
   * @extends Error
   */
  constructor(resourceType = 'Resource', resourceName = '', ...args) {
    super(...args);

    this.resourceType = resourceType;
    this.resourceName = resourceName ? `"${resourceName}" ` : '';
  }
}

/**
 * The base resource exception, to be extended when exceptions are related to individual resources
 * @module ResourceException
 */
module.exports = ResourceException;
