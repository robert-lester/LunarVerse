const assert = require('chai').assert;
const lambda = require('../lpp');

describe('lambda++', () => {
  describe('#response', () => {
    it('should create a good response', () => {
      const data = 'Hello';
      const code = 200;
      const headers = {};

      const response = lambda.response(data, code, headers);
      assert(response.statusCode === code, 'StatusCode is not being set properly');
      assert(response.body === `{"message":"${data}"}`, 'Body is not being set correctly');
      assert(response.headers === lambda.DEFAULT_HEADERS, 'The default headers are not being set correctly');
    });

    it('should create an error response', () => {
      const data = 'Error';
      const code = 500;
      const headers = {};

      const response = lambda.response(data, code, headers);
      assert(response.statusCode === code, 'StatusCode is not being set properly');
      assert(response.body === `{"errors":"${data}"}`, 'Body is not being set correctly');
      assert(response.headers === lambda.DEFAULT_HEADERS, 'The default headers are not being set correctly');
    });
  });

  describe('#handleError', () => {
    it('should handle an error and call the serverless callback for a 400 error', () => {
      const error = new Error();
      error.statusCode = 400;
      error.message = 'Message';
      lambda.handleError(error, (awsResponse, httpResponse) => {
        assert(httpResponse.statusCode === error.statusCode, 'StatusCode is not being set properly');
        assert(httpResponse.body === `{"errors":"${error.message}"}`, 'Body is not being set correctly');
        assert(httpResponse.headers === lambda.DEFAULT_HEADERS, 'The default headers are not being set correctly');
        assert(awsResponse === null, 'The cloudwatch response should be set to null, but is not null');
      });
    });

    it('should handle an error and call the cloudwatch callback for a 500 error', () => {
      const error = new Error();
      error.statusCode = 500;
      error.message = 'Message';
      lambda.handleError(error, (awsResponse, httpResponse) => {
        assert(awsResponse === `[${error.statusCode}] ${error.message}`, 'The AWS cloudwatch error is not being set properly');
        assert(httpResponse === undefined, `The serverless response should be set to undefined, but has a value of ${httpResponse}`);
      });
    });
  });

  describe('#parseBody', () => {
    it('should parse out the http POST body', () => {
      const post = `{"unit":"test"}`;
      const json = lambda.parseBody(post);
      assert(typeof json === 'object', 'Parse body is not returning an object');
      assert(json.unit === 'test', 'Parse body is not parsing the values correctly');
    });

    it('should parse out the querystring', () => {
      const querystring = 'unit=test';
      const json = lambda.parseBody(querystring);
      assert(typeof json === 'object', 'Parse body is not returning an object');
      assert(json.unit === 'test', 'Parse body is not parsing the values correctly');
    });

    it('should return an empty object on null and undefined', () => {
      const undef = lambda.parseBody(undefined);
      const nul = lambda.parseBody(null);

      assert(typeof undef === 'object', 'Parse body is not returning an object');
      assert(Object.keys(undef).length === 0 && undef.constructor === Object, 'Parse body is not parsing the values correctly');

      assert(typeof nul === 'object', 'Parse body is not returning an object');
      assert(Object.keys(nul).length === 0 && nul.constructor === Object, 'Parse body is not parsing the values correctly');
    });
  });

  describe('#parseToken', () => {
    it('should parse a token out of a header', () => {
      const headers = { Authorization: 'Unit:Test' };
      const token = lambda.parseToken(headers);
      assert(token === 'Test', 'Unable to parse out working token');
    });

    it('should return an empty string on bad input', () => {
      const headers = { Authorization: '' };
      const token = lambda.parseToken(headers);
      assert(token === '', 'Token should be empty but isn\'t (Empty Authorization header)');

      const token2 = lambda.parseToken();
      assert(token2 === '', 'Token should be empty but isn\'t (Empty object)');

      headers.Authorization = 'Unit:Test:OhNo!';
      const token3 = lambda.parseToken(headers);
      assert(token3 === '', 'Token should be empty on bad input but isn\'t (Multiple colons)');
    });
  });
});