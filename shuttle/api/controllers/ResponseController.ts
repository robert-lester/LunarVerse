import Controller from './Controller';
import { Response } from '../models';

import * as Types from '../../@types';
import { IControllerCreate } from './interfaces';

class ResponseController extends Controller implements IControllerCreate {
  //#region Public Functions
  /**
   * Create a new Response object(s) in the database. Supports creating multiple Responses.
   * @param organization The organization the Response(s) belongs to.
   * @param data The data to assign to the Response row(s).
   * @param options The API options provided in the query string.
   * @returns A promise containing the newly inserted Response(s).
   */
  public async create(organization: string, data: Response|Response[], options: Types.ApiOptions = {}): Promise<Response|Response[]>  {
    this.connect();

    if (Array.isArray(data)) {
      return this.createMultiple(data as Response[]);
    } else {
      return this.createSingle(data as Response);
    }
  }
  //#endregion
  //#region Private Functions
  /**
   * Private helper function to create a single Response object in the database.
   * @param organization The organization the Response belongs to.
   * @param data The data to assign to the Response row.
   * @param options The API options provided in the query string.
   * @returns A promise containing the newly inserted Response.
   */
  private async createSingle(data: Response): Promise<Response> {
    const insert: Response = Object.assign(data, {
      created_at: new Date(),
      updated_at: new Date(),
    });

    return Response.query(this.connection).insertAndFetch(insert);
  }

  /**
   * Private helper function to create multiple Response objects in the database.
   * @param organization The organization the Responses belong to.
   * @param data The data to assign to the Response rows.
   * @param options The API options provided in the query string.
   * @returns A promise containing the newly inserted Response.
   */
  private async createMultiple(data: Response[]): Promise<Response[]> {
    for (let x = 0; x < data.length; x++) {
      const responseWithOrg: Response = Object.assign(data[x], {
        created_at: new Date(),
        updated_at: new Date(),
      });
      data[x] = responseWithOrg;
    }

    return Response.query(this.connection).insertGraph(data);
  }
  //#endregion
}

export default ResponseController;
