import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import {
  BindOptions,
  SimpleHandler,
} from '../@types';
import Handler from './Handler';
import { checkCORS } from '../../lambda++';

export {
  // Export aws-lambda types to fix inferred type problems by consumers
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  BindOptions,
  SimpleHandler,
};

const defaultBindOptions: BindOptions = {
  includeSuccess: false,
}

export class HTTPError extends Error {
  public constructor(public statusCode: number, message = '') {
    super(message);
    Error.captureStackTrace(this, HTTPError);
  }
}

export class HTTPHandler extends Handler<APIGatewayProxyEvent, APIGatewayProxyResult> {
  public constructor(private options = defaultBindOptions) {
    super();
  }

  /**
   * Parse a response and format it to be compatible with CloudFront
   * @param body The response object
   */
  protected respond(body: any): APIGatewayProxyResult {
    let statusCode = 200;

    let headers = {
        'Access-Control-Allow-Origin': '*',
        'charset': 'utf-8',
        'Content-Length': 0,
        'Content-Type': 'application/json',
    };

    if (this.request) {
      if ('origin' in this.request.headers && this.request.headers.origin.length > 0 && process.env.CORS_ORIGIN && !process.env.IS_OFFLINE && process.env.STAGE !== 'test') {
        let origin = this.request.headers.origin;
        let result = Handler.checkCORS(origin, process.env.CORS_ORIGIN);

        if (result.statusCode !== 200) {
          statusCode = result.statusCode;
          body = result.message;
        }

        headers['Access-Control-Allow-Origin'] = origin;
      }
    }

    // Only if the CORS check is successful, do body processing 
    // TODO: Refactor this lambda library nonsense. Controller SHOULD NOT be allowed to execute before HTTP processing and validation
    if (statusCode === 200) {
      console.info('Response body:\n', body);

      switch (typeof body) {
        case 'boolean':
        case 'number':
        case 'object':
        case 'string':
        case 'undefined':
          if (typeof body === 'undefined') {
            body = '';
          }

          if (body instanceof Error || body.statusCode) {
            if ((body as any).isJoi) {
              statusCode = 400;
              body = (body as any).details.map((detail) => detail.message);
            } else {
              statusCode = body.statusCode || 500;
            }
            body = statusCode < 500 ? (body instanceof Error ? body.message : body) : '';
          }
          
          if (this.options.includeSuccess && (typeof body !== 'object' || Array.isArray(body))) {
            body = {
              response: body,
            };
          }
          break;
        case 'function':
        case 'symbol':
        default:
          throw new TypeError(`${typeof body} is not a valid response type`); 
      }

      try {
        if (this.options.includeSuccess) {
          body.success = statusCode < 400;
        }
        body = JSON.stringify(body);
      } catch (err) {
        console.error('Body could not be stringified for response', err);
        body = this.options.includeSuccess ? '{"success":false}' : '';
        statusCode = 500;
      }
    }

    return {
      body,
      headers: Object.assign(headers, { 'Content-Length': Buffer.byteLength(body, 'utf-8') }),
      statusCode,
    };
  }
}