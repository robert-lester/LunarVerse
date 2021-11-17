/**
 * A module containing utilities for AWS Lambda
 * @module lambda-utils
 */

const qs = require('qs');
const minimatch = require('minimatch');

const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  charset: 'utf-8',
  'Content-Length': 0,
  'content-type': 'application/json',
};

module.exports = class LambdaPlusPlus {
  static get DEFAULT_HEADERS() {
    return DEFAULT_HEADERS;
  }

  /**
   * Prints AWS event information to the console 
   */
  static printEventInformation(event) {
    if ('X-Amz-Cf-Id' in event.headers) {
      console.info(`X-Amz-Cf-Id=${event.headers['X-Amz-Cf-Id']}`);
    }

    if (process.env.IS_OFFLINE || process.env.STAGE === 'test' || process.env.STAGE === 'staging' || process.env.STAGE === 'qa') {
      console.info('EVENT HEADERS: ', event.headers);
    }
  }

  /**
   * Checks to determine if origin is valid for CORS
   * @param {string} origin A string containing a properly formatted URL
   * @param {string} originPatterns A comma delimited string containing URL patterns
   * @returns {object} A map containing the properly an HTTP status code, access control header, and message
   * @static
   */
  static checkCORS(origin, originPatterns) {
    let result = {
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      statusCode: 400,
      message: 'The request did not contain a valid origin header.'
    }; 

    if (!origin || origin.length === 0) {
      return result;
    }

    originPatterns = originPatterns.split(',');
    let corsMatches = originPatterns.filter(originPattern => {
      let match = minimatch.match([origin], originPattern, { nonull: false, dot: true });
      return match.length !== 0;
    });

    if (corsMatches.length === 0) {
      result.statusCode = 403;
      result.message = `\"${origin}\" is not an allowed domain.`;
      return result;
    }

    result.statusCode = 200;
    result.headers['Access-Control-Allow-Origin'] = origin;
    result.message = '';
    return result;
  }

  /**
   * Convert data into a response format compatible with Lambda HTTP bindings
   * @param data Data returned by an API's business logic controllers
   * @param {number} [statusCode=200] The HTTP status that should be returned
   * @param {object} [headers={}] A map of headers to add to the response
   * @param {string} origin A string containing a valid URL taken from HTTP Origin header
   * @returns {object} A map containing the properly formatted HTTP response
   * @static
   */
  static responseCheckCORS(data, callback, headers = {}, statusCode = 200) {
    console.info('CORERESPONSECHECKCORS: ', headers);
    console.info('CORERESPONSECHECKCORS: ', process.env);
    // TODO: Remove the assumption of certain environment variables existing. This is intended to be a library.
    if ('origin' in headers && headers.origin.length > 0 && process.env.CORS_ORIGIN && !process.env.IS_OFFLINE && process.env.STAGE !== 'test') {
      let origin = headers.origin;
      let result = this.checkCORS(origin, process.env.CORS_ORIGIN);

      if (result.statusCode !== 200) {
        statusCode = result.statusCode;
      }

      headers = { 'Access-Control-Allow-Origin': origin };
      console.info('CORERESPONSECHECKCORS:SUCCESS ', headers);
    }
    else {
      console.info('CORERESPONSECHECKCORS:FAIL ', headers.origin);
    }

    return this.response(data, callback, statusCode, headers)
  }

  /**
   * Convert data into a response format compatible with Lambda HTTP bindings
   * @param data Data returned by an API's business logic controllers
   * @param {number} [statusCode=200] The HTTP status that should be returned
   * @param {object} [headers={}] A map of headers to add to the response
   * @returns {object} A map containing the properly formatted HTTP response
   * @static
   */
  static response(data, callback, statusCode = 200, headers = {}) {
    let body = data;

    if (statusCode > 399) {
      body = { errors: data };
    } else if (typeof body === 'string') {
      body = body === '' ? '' : { message: data };
    }
    body = typeof body === 'object' ? JSON.stringify(body) : body;

    headers =  Object.assign(DEFAULT_HEADERS, headers, {
        'Content-Length': Buffer.byteLength(body, 'utf-8'),
    });

    console.info('CORERESPONSE', headers);

    return callback(null, {
      statusCode,
      body,
      headers
    });
  }

  /**
   * Convert API errors to a format compatible with Lambda HTTP bindings or CloudWatch logs
   * @param {Error} error A default JavaScript error, or a compatible custom exception object
   * @param {function} callback The callback for the Lambda function
   */
  static handleError(error, callback) {
    let statusCode = 500;
    let message = error;

    if (error.statusCode && error.message) {
      ({ statusCode } = error);
      ({ message } = error);
    }

    // If the error is not internal, return it to the calling context
    if (statusCode < 500) {
      LambdaPlusPlus.response(message, callback, statusCode);
    // Otherwise, log it in CloudWatch
    } else {
      console.error(error);

      callback(null, {
        body: '',
        statusCode,
        headers: DEFAULT_HEADERS,
      });
    }
  }

  /**
   * Transform a querystring into a map
   * @param {string} body The "event.body" passed to a Lambda
   * @returns {object} The parsed body
   */
  static parseBody(body) {
    if (body === null || body === undefined) {
      return {};
    }

    try {
      return JSON.parse(body);
    } catch (err) {
      return qs.parse(body || '');
    }
  }

  /**
   * Parses out the Auth token from the HTTP headers
   * @param {Object} headers The HTTP header to parse
   */
  static parseToken(headers) {
    if (headers === null || typeof headers !== 'object') {
      return '';
    }
    let authHeader = headers.authorization;

    if (!authHeader) {
      authHeader = headers.Authorization;
    }
    return typeof authHeader === 'string' && authHeader.includes(':') ? authHeader.split(':')[1] : '';
  }

  /**
   * Binds an asyncronous handler function to the Lambda runtime so responses and errors can be returned and caught respectively
   * @param {function} handler A function to handle the HTTP request
   * @returns {function} A function to call the handler from within the Lambda runtime
   */
  static bindHandler(handler) {
    return async (event, context) => {
      try {
        const response = await handler(event, context);
        return {
          body: JSON.stringify(response),
          headers: DEFAULT_HEADERS,
          isBase64Encoded: false,
          statusCode: 200,
        };
      } catch (err) {
        const statusCode = err.statusCode || 500;
  
        if (statusCode > 499) {
          console.error(err.stack);
        }
        return {
          body: statusCode > 499 ? '' : JSON.stringify({ errors: err.message }),
          headers: DEFAULT_HEADERS,
          isBase64Encoded: false,
          statusCode,
        };
      }
    };
  }
};
