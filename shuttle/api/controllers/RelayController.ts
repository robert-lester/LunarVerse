import Controller from './Controller';
import { Source, Relay } from '../models';

import * as Types from '../../@types';
import { IControllerIndex, IControllerCreate, IControllerArchivable } from './interfaces';
import { ResourceNotFoundException } from '../../exceptions';

class RelayController extends Controller implements IControllerIndex, IControllerCreate, IControllerArchivable {
  //#region Public Functions
  /**
   * Retrieve all Relays in a given organization
   * @param organization The organization the Relays belong to
   * @returns A promise containing a Relay array of all Relays for an organization
   */
  public async index(organization: string): Promise<Relay[]>  {
    this.connect();
    return Relay.query(this.connection)
      .where('organization_id', organization)
      .where('archived', false);
  }

  /**
   * Create a new Relay object in the database
   * @param organization The organization the Relay belongs to
   * @param data The data to assign to the Relay row
   * @returns A promise containing the newly inserted Pod
   */
  public async create(organization: string, data: Relay): Promise<Relay>  {
    this.connect();

    const insert: Relay = Object.assign(data, {
      archived: false,
      created_at: new Date(),
      organization_id: organization,
      updated_at: new Date(),
    });

    return Relay.query(this.connection).insertAndFetch(insert);
  }

  /**
   * Archive a Relay object to hide in read requests
   * @param organization The organization the Relay belongs to
   * @param id The primary key of the Relay to archive
   * @returns A promise with an empty object
   */
  public async archive(organization: string, id: number): Promise<any> {
    this.connect();

    const relay: Relay = await Relay.query(this.connection)
      .updateAndFetchById(id, {
        archived: true,
        updated_at: new Date(),
      }).where('organization_id', organization);

    if (!relay) {
      throw new ResourceNotFoundException();
    } else {
      // Also delete relays in Source mapping
      const sources: Source[] = await Source.query(this.connection)
        .where('mapping', 'like', `%"${id}"%`)
        .where('organization_id', organization);

      sources.forEach((source, index, array) => {
        source.parseJson();
        delete source.mapping[id];
        source = Source.stringifyJson(source);
        array[index] = source;
      });

      if (sources.length) {
        await Source.query(this.connection).upsertGraph(sources);
      }
    }

    return {};
  }

  /**
   * Un-archive a Relay object to hide in read requests
   * @param organization The organization the Relay belongs to
   * @param id The primary key of the Relay to archive
   * @returns A promise containing the restored Relay object
   */
  public async restore(organization: string, id: number, options: Types.ApiOptions = {}): Promise<Relay> {
    this.connect();

    const relay: Relay = await Relay.query(this.connection)
      .updateAndFetchById(id, {
        archived: false,
        updated_at: new Date(),
      }).where('organization_id', organization);

    if (!relay) {
      throw new ResourceNotFoundException();
    }

    return relay;
  }
  //#endregion
  //#region Private Functions
  //#endregion
}

export default RelayController;
