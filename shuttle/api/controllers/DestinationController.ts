import * as moment from 'moment';

import TaggableController from './TaggableController';
import Rocket from '../../../lib/rocket/integrations/rocket';
import setTokenResponse from '../../../lib/rocket/integrations/types/setTokenResponse';
import { Destination, Tag, Response } from '../models';
import * as NosQL from '../../../lib/nos-ql';
import * as Types from '../../@types';
import { ResourceNotFoundException } from '../../exceptions';
import {
  IControllerIndex,
  IControllerCreate,
  IControllerRead,
  IControllerUpdate,
  IControllerArchivable,
} from './interfaces';

class DestinationController extends TaggableController
  implements
    IControllerIndex,
    IControllerCreate,
    IControllerRead,
    IControllerUpdate,
    IControllerArchivable {
  //#region Public Functions
  /**
   * Retrieve all Destinations in a given organization
   * @param organization The organization the Destinations belong to
   * @param options The API options provided in the query string
   * @returns A promise containing a Destination array of all Destinations for an organization
   */
  public async index(organization: string, options: Types.ApiOptions = {}): Promise<Destination[]> {
    this.connect();

    const eager: string = `${options.withTags ? '[tags,' : ''}responses${
      options.withTags ? ']' : ''
    }`;
    const destinations: Destination[] = await Destination.query(this.connection)
      .where('organization_id', organization)
      .where('archived', false)
      .eager(eager);

    // Create promise array to format all destinations async from each other
    const promises: Array<Promise<Destination>> = [];
    for (let x = 0; x < destinations.length; x++) {
      promises.push(this.format(destinations[x], options));
    }

    return Promise.all(promises);
  }

  /**
   * Create a new Destination object in the database
   * @param organization The organization the Destination belongs to
   * @param data The data to assign to the Destination row
   * @param options The API options provided in the query string
   * @returns A promise containing the newly inserted Destination
   */
  public async create(
    organization: string,
    data: any,
    options: Types.ApiOptions = {},
  ): Promise<any> {
    this.connect();

    // Add autogen fields
    let insert: Destination = Object.assign(data, {
      archived: false,
      created_at: new Date(),
      organization_id: organization,
      updated_at: new Date(),
    });

    // Build Tag associations if you are inserting tags
    const isInsertingTags = insert.tags ? true : false;
    if (isInsertingTags) {
      insert.tags = TaggableController.buildGraphTagObject(insert.tags, organization);
    }

    // Create a config if destination type is post and
    // add a default dataType
    if (insert.type === 'post') {
      insert.config = {
        dataType: 'form',
      };
    }

    // Encrypt the config if it is Salesforce (because it contains the password/token)
    if (insert.config && insert.type === 'salesforce') {
      insert.config.sandbox = insert.config.sandbox || 0;
      insert.config = await Destination.encryptConfig(insert);
      insert.encryption_version = 1;
    } else {
      // Stringify because DB type is TEXT not JSON
      insert = Destination.stringifyJson(insert);
    }

    insert = Destination.setDefaults(insert);

    // Do Graph insert to insert Destination, Tags, and relations in one transaction
    const eager: string = `${options.withTags ? '[tags,' : ''}responses${
      options.withTags ? ']' : ''
    }`;

    const destination: Destination = await Destination.query(this.connection)
      .insertGraphAndFetch(insert)
      .eager(eager);

    // Return formatted data
    return this.format(destination, options);
  }

  /**
   * Retrieve an individual Destination from the database given an ID
   * @param organization The organization the Destination belongs to
   * @param id The primary key of the Destination
   * @param options The API options provided in the query string
   * @returns A promise containing the Destination with the primary key provided
   */
  public async read(
    organization: string,
    id: number | number[],
    options: Types.ApiOptions = {},
  ): Promise<Destination | Destination[]> {
    this.connect();

    if (Array.isArray(id)) {
      return this.readMultiple(organization, id as number[], options);
    } else {
      return this.readSingle(organization, id as number, options);
    }
  }

  /**
   * Updates an individual Destination in the database given a partial Destination
   * @param organization The organization the Destination belongs to
   * @param data The data to update in the Destination, must contain ID
   * @param options The API options provided in the query string
   * @returns A promise containing the updated Destination
   */
  public async update(
    organization: string,
    data: Destination,
    options: Types.ApiOptions = {},
  ): Promise<Destination> {
    this.connect();

    const isInsertingTags = data.tags ? true : false;
    if (isInsertingTags) {
      data.tags = TaggableController.buildGraphTagObject(data.tags, organization);
    }

    // Manipulate encrypted / weird data
    if (data.config) {
      // Salesforce / General Password
      if (data.config.password || data.config.token) {
        data.config.sandbox = data.config.sandbox || 0;
        data.encryption_version = 2;
      } else {
        // Create a Sheet in Google Sheets
        if (!data.config.sheetId && data.config.title && !data.config.sheetId.length) {
          try {
            const nosql = new NosQL();
            const rocket: any = new Rocket('google sheets', data.config);
            nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');

            const orgRow = await nosql.read(organization);
            const googleClientTokens: setTokenResponse = await rocket.setToken(orgRow.google_tokens);

            if (googleClientTokens.newTokens) {
              nosql.update(organization, { google_tokens: googleClientTokens.tokens });
            }
            data.config.sheetId = await rocket.createSheet(data.config.title);
          } catch (e) {
            data.config.sheetId = '';
          }
        }
      }
    }
    // Stringify because DB type is TEXT not JSON
    data = Destination.stringifyJson(data);

    const eager: string = `${options.withTags ? '[tags,' : ''}responses${
      options.withTags ? ']' : ''
    }`;
    const destination: Destination = await Destination.query(this.connection)
      .upsertGraphAndFetch(data, { unrelate: true })
      .where('organization_id', organization)
      .eager(eager);

    if (!destination) {
      throw new ResourceNotFoundException();
    }

    return this.format(destination, options);
  }

  /**
   * Archive a Destination object to hide in read requests
   * @param organization The organization the Destination belongs to
   * @param id The primary key of the Destination to archive
   * @returns A promise with an empty object
   */
  public async archive(organization: string, id: number): Promise<any> {
    this.connect();

    const destination: Destination = await Destination.query(this.connection)
      .updateAndFetchById(id, {
        archived: true,
        updated_at: new Date(),
      })
      .where('organization_id', organization);

    if (!destination) {
      throw new ResourceNotFoundException();
    }

    return {};
  }

  /**
   * Un-archive a Destination object to hide in read requests
   * @param organization The organization the Destination belongs to
   * @param id The primary key of the Destination to archive
   * @param options The API options provided in the query string
   * @returns A promise containing the restored Destination object
   */
  public async restore(
    organization: string,
    id: number,
    options: Types.ApiOptions = {},
  ): Promise<Destination> {
    this.connect();

    const eager: string = `${options.withTags ? '[tags,' : ''}responses${
      options.withTags ? ']' : ''
    }`;
    const destination: Destination = await Destination.query(this.connection)
      .updateAndFetchById(id, {
        archived: false,
        updated_at: new Date(),
      })
      .where('organization_id', organization);

    if (!destination) {
      throw new ResourceNotFoundException();
    }

    return this.format(destination, options);
  }

  /**
   * Checks if there are google sheets tokens in the DB
   * If not, get tokens from rocket. Set the tokens and update the DB
   * @param organization organization that the destination is associated with
   * @param token refresh token from the google auth callback
   */
  public async sheetsOauth(organization: string, token: string) {
    try {
      const nosql = new NosQL();
      const rocket = new Rocket('google sheets', {});
      let initialTokens;

      nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
      const orgRow = await nosql.read(organization);

      if (!orgRow.google_tokens) {
        initialTokens = await rocket.getInitialTokens(token);
        orgRow.google_tokens = initialTokens;
      }

      const googleClientTokens: setTokenResponse = await rocket.setToken(orgRow.google_tokens);
      googleClientTokens.tokens.refresh_token = token;

      if (googleClientTokens.newTokens || initialTokens) {
        nosql.update(organization, { google_tokens: googleClientTokens.tokens });
      }
    } catch (err) {
      console.error(err);
    }
  }
  //#endregion
  //#region Private Functions
  /**
   * Clean up a Destination by parsing JSON, decrypting data, and handling query string options
   * @param destination An unformatted Destination from the database
   * @param options The API options provided in the query string
   * @returns A promise containing a formatted Destination object
   */
  private async format(destination: Destination, options: Types.ApiOptions): Promise<Destination> {
    if (destination.type === 'salesforce') {
      destination.config = await Destination.decryptConfig(destination);
    }

    destination.parseJson();

    if (destination.type === 'google sheets') {
      const rocket = new Rocket('google sheets', destination.config);
      const nosql = new NosQL();

      nosql.setTable(`${process.env.API_RESOURCE_PREFIX}.organizations`, 'id');
      const orgRow = await nosql.read(destination.organization_id);

      if (orgRow.google_tokens) {
        destination.config.isAuth = true;
      } else {
        destination.config.isAuth = false;
      }

      destination.config.googleAuthUrl = rocket.generateOAuthUrl(destination.organization_id);
    }
    // TODO: Add POD counts back in if the DB is ever optimized enough to work with them.
    delete destination.responses;
    return destination;
  }

  /**
   * Private helper function for use in this.read() to allow reading of single Destination
   * @param organization The organization the Destination belongs to
   * @param id The primary key of the Destination
   * @param options The API options provided in the query string
   * @returns A promise containing the Destination object with the provided primary key
   */
  private async readSingle(
    organization: string,
    id: number,
    options: Types.ApiOptions = {},
  ): Promise<Destination> {
    const eager: string = `${options.withTags ? '[tags,' : ''}responses${
      options.withTags ? ']' : ''
    }`;
    const destination: Destination = await Destination.query(this.connection)
      .where('organization_id', organization)
      .where('archived', false)
      .findById(id)
      .eager(eager);

    if (!destination) {
      throw new ResourceNotFoundException();
    }

    return this.format(destination, options);
  }

  /**
   * Private helper function for use in this.read() to allow reading of multiple Destinations
   * @param organization The organization the Destinations belong to
   * @param arr An array of primary keys of the Destination
   * @param options The API options provided in the query string
   * @returns A promise containing an Array of Destination objects with the provided primary keys
   */
  private async readMultiple(
    organization: string,
    arr: number[],
    options: Types.ApiOptions = {},
  ): Promise<Destination[]> {
    const eager: string = `${options.withTags ? '[tags,' : ''}responses${
      options.withTags ? ']' : ''
    }`;
    const destinations: Destination[] = await Destination.query(this.connection)
      // .where('organization_id', organization)
      .where('archived', false)
      .whereIn('id', arr)
      .eager(eager);

    if (!destinations || destinations.length === 0) {
      throw new ResourceNotFoundException();
    }

    const promises: Array<Promise<Destination>> = [];
    for (let x = 0; x < destinations.length; x++) {
      promises.push(this.format(destinations[x], options));
    }

    return Promise.all(promises);
  }
  //#endregion
}

export default DestinationController;
