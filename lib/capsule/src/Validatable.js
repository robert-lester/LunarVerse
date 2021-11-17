/* eslint-disable security/detect-object-injection */
const Joi = require('joi');
const ValidationException = require('./exceptions/ValidationException');

const COMMENT_REGEX = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg;
const PARAM_NAME_REGEX = /([^\s,]+)/g;

// Map an array of arguments to a function, given its signature
const mapParamNames = (func, ...args) => {
  // Get the function signature as a string and remove any comments
  const funcString = func.toString().replace(COMMENT_REGEX, '');

  // Get the array of parameter names
  const funcParams = funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')')).match(PARAM_NAME_REGEX);

  // Map the function's parameter names to the incoming arguments
  return (funcParams || []).reduce((params, param) => {
    const newParams = params;

    newParams[param] = args.shift();

    return newParams;
  }, {});
};

/**
 * Enforce input schema on all class methods
 * @alias module:Validatable
 */
class Validatable {
  /**
   * Initialize a new validatable controller
   * @param {array} protectedKeys An array of keys that should not have validation
   * @returns {Proxy} A copy of the extended class with proxied getter methods
   */
  constructor(protectedKeys = []) {
    // Intercept all getters with a proxy
    return new Proxy(this, {
      get(target, key) {
        // Store the original method so we can override it
        const originalMethod = target[key];

        // If the key is exempt from validation, return the original method
        if ((protectedKeys).includes(key)) {
          return target[key];
        }

        // Return a passthrough method so we can access the passed parameters
        return function validateMethod(...args) {
          if (!target.schema[key]) {
            return Promise.reject(new ValidationException(`No schema set for method "${key}"`));
          }

          // Validate the input parameters against the schema
          const params = mapParamNames(target[key], ...args);
          const results = Joi.validate(params, target.schema[key]);

          if (results.error) {
            return Promise.reject(new ValidationException(results.error.message));
          }

          // Take Joi schema results to get default values
          const newArgs = Object.keys(results.value).map(argName => results.value[argName]);

          return originalMethod.apply(target, newArgs);
        };
      },
    });
  }
}

/**
 * A module for enforcing input schema on all class methods
 * @module Validatable
 */
module.exports = Validatable;
