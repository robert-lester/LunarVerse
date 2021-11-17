import { Controller } from '../@types';
import * as minimatch from 'minimatch';

export default abstract class Handler<RequestType, ResponseType> {
  // The request passed into bind
  request: RequestType = null;

  /**
   * Bind a Controller to a Handler such that the response is handled
   * consistently, success or failure.
   * @param controller A function to call when the handler receives a request.
   */
  public bind = (controller: Controller<RequestType>) => async (request: RequestType) => {
    try {
      this.request = request;
      return this.respond(await controller(request));
    } catch (err) {
      return this.respond(err);
    }
  }

  /**
   * A method to normalize responses before returning them to the calling context.
   * @param body The object returned by the controller upon request completion, or an Error.
   */
  protected abstract respond(body: any): ResponseType

  /**
   * Checks to determine if origin is valid for CORS
   * @param {string} origin A string containing a properly formatted URL
   * @param {string} originPatterns A comma delimited string containing URL patterns
   * @returns {object} A map containing the properly an HTTP status code, access control header, and message
   * @static
   */
  public static checkCORS(origin, originPatterns) {
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
}