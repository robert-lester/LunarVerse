/* eslint-disable security/detect-object-injection */
const Joi = require('joi');
const Scaffold = require('./Scaffold');
const ValidationException = require('./exceptions/ValidationException');

const COMMENT_REGEX = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg;
const PARAM_NAME_REGEX = /([^\s,]+)/g;

const mapParams = (method, ...args) => {
  const methodString = method.toString().replace(COMMENT_REGEX, '');
  const methodParams = methodString.slice(methodString.indexOf('(') + 1, methodString.indexOf(')')).match(PARAM_NAME_REGEX);

  return (methodParams || []).reduce((params, param) => {
    const newParams = params;

    newParams[param] = args.shift();

    return newParams;
  }, {});
};

class Controller extends Scaffold {
  constructor(ignoredMethods = []) {
    super();

    if (!Array.isArray(ignoredMethods)) {
      throw new Error('Validator ignoredMethods must be an array');
    }

    this.ignoredMethods = ignoredMethods.concat(['withUser', 'registerAuthorizer']);
  }

  handler(target, key, ...args) {
    let methodParams = args;

    if (!this.ignoredMethods.includes(key)) {
      if (!target.schema[key]) {
        return Promise.reject(new ValidationException(`No schema set for method "${key}"`));
      }

      const params = mapParams(target[key], ...args);
      const results = Joi.validate(params, target.schema[key]);

      if (results.error) {
        return Promise.reject(new ValidationException(results.error.message));
      }

      methodParams = Object.keys(results.value).map(param => results.value[param]);
    }

    return target[key](...methodParams);
  }

  registerAuthorizer(authorizer) {
    this.user = authorizer;

    Object.keys((this.controllers || {})).forEach((controllerName) => {
      if (controllerName !== 'auth') {
        this.controllers[controllerName].registerAuthorizer(authorizer);
      }
    });
  }

  withUser(accessToken, testUser = null) {
    if (!this.userAuthorizerFactory) {
      throw new Error('A userAuthorizerFactory must be provided to the controller');
    }

    return this.userAuthorizerFactory.getAuthorizer(accessToken, testUser)
      .then(authorizer => this.registerAuthorizer(authorizer));
  }
}

module.exports = Controller;
