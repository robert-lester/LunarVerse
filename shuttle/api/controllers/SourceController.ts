import * as uuid from 'uuid/v4';
import * as moment from 'moment';
import * as Knex from 'knex';

import FormBuilder from '../../../lib/forms/builder/index';
import TaggableController from './TaggableController';
import TagController from './TagController';
import { Source, Tag, Pod } from '../models';
import * as Types from '../../@types';
import { ResourceNotFoundException } from '../../exceptions';
import {
  IControllerIndex,
  IControllerCreate,
  IControllerRead,
  IControllerUpdate,
  IControllerArchivable,
} from './interfaces';

class SourceController extends TaggableController implements IControllerIndex, IControllerCreate, IControllerRead, IControllerUpdate, IControllerArchivable {
  private formbuilder: FormBuilder;

  constructor(knex: Knex) {
    super(knex);
    this.formbuilder = new FormBuilder(process.env.BUCKET);
  }
  //#region Public Functions
  /**
   * Retrieve all Sources in a given organization
   * @param organization The organization the Sources belong to
   * @param options The API options provided in the query string
   * @returns A promise containing a Source array of all Sources for an organization
   */
  public async index(organization: string, options: Types.ApiOptions = {}) {
    this.connect();

    const eager: string = options.withTags ? 'tags' : '';
    const sources: Source[] = await Source.query(this.connection)
      .where('organization_id', organization)
      .where('archived', false)
      .eager(eager);

    const promises: Array<Promise<Source>> = [];
    for (let x = 0; x < sources.length; x++) {
      promises.push(this.format(sources[x], options));
    }

    return Promise.all(promises);
  }

  /**
   * Create a new Source object in the database
   * @param organization The organization the Source belongs to
   * @param data The data to assign to the Source row
   * @param options The API options provided in the query string
   * @returns A promise containing the newly inserted Source
   */
  public async create(organization: string, data: Source, options: Types.ApiOptions = {}): Promise<Source> {
    this.connect();

    // Add autogen fields and set defaults for Source
    const insert: Source = Source.setDefaults(
      Object.assign(data, {
        api_key: uuid(),
        archived: false,
        created_at: new Date(),
        organization_id: organization,
        updated_at: new Date(),
      }),
    );

    const isInsertingTags = insert.tags ? true : false;
    if (isInsertingTags) {
      insert.tags = TaggableController.buildGraphTagObject(insert.tags, organization);
    }

    // Do Graph insert to insert Source, Tags, and relations in one transaction
    const eager: string = options.withTags ? 'tags' : '';
    const source: Source = await Source.query(this.connection)
      .insertGraphAndFetch(insert)
      .eager(eager);

      // Only build form on create/update
    if (source.form) {
      await this.formbuilder.build(source.api_key, source.form);
    }

    return this.format(source, options);
  }

  /**
   * Retrieve an individual Source from the database given an ID
   * @param organization The organization the Source belongs to
   * @param id The primary key of the Source
   * @param options The API options provided in the query string
   * @returns A promise containing the Source with the primary key provided
   */
  public async read(organization: string, id: number|string, options: Types.ApiOptions = {}): Promise<Source> {
    this.connect();

    // TODO: Check for uuid when we have a stdlib setup
    let source: Source;
    const eager = options.withTags ? 'tags' : '';

    if (typeof id === 'string' || organization === null)  {
      // Assume this is an API key if its a string
      source = await Source.query(this.connection)
        // .where('organization_id', organization)
        .where('archived', false)
        .where('api_key', id)
        .first()
        .eager(eager);
    } else {
      source = await Source.query(this.connection)
        .where('organization_id', organization)
        .where('archived', false)
        .findById(id)
        .eager(eager);
    }

    if (!source) {
      throw new ResourceNotFoundException();
    }

    return this.format(source, options);
  }

  /**
   * Updates an individual Source in the database given a partial Source
   * @param organization The organization the Source belongs to
   * @param data The data to update in the Destination, must contain ID
   * @param options The API options provided in the query string
   * @returns A promise containing the updated Source
   */
  public async update(organization: string, data: Source, options: Types.ApiOptions = {}): Promise<Source> {
    this.connect();

    // TODO: Make this better, needed for updating fields
    if (organization === null) {
      return Source.query(this.connection).updateAndFetch(data);
    }

    const isInsertingTags = data.tags ? true : false;
    if (isInsertingTags) {
      data.tags = TaggableController.buildGraphTagObject(data.tags, organization);
    }

    const eager = options.withTags ? 'tags' : '';
    const formatted = Source.stringifyJson(data);
    const source: Source = await Source.query(this.connection)
      .upsertGraphAndFetch(formatted, { unrelate: true })
      .where('organization_id', organization)
      .eager(eager);

    if (!source) {
      throw new ResourceNotFoundException();
    } else {
      if (source.form) {
        await this.formbuilder.build(source.api_key, source.form);
      }
    }

    return this.format(source, options);
  }

  /**
   * Archive a Source object to hide in read requests
   * @param organization The organization the Source belongs to
   * @param id The primary key of the Source to archive
   * @returns A promise with an empty object
   */
  public async archive(organization: string, id: number): Promise<any> {
    this.connect();

    const source: Source = await Source.query(this.connection)
      .updateAndFetchById(id, {
        archived: true,
        updated_at: new Date(),
      }).where('organization_id', organization);

    if (!source) {
      throw new ResourceNotFoundException();
    }

    return {};
  }

  /**
   * Un-archive a Source object to hide in read requests
   * @param organization The organization the Source belongs to
   * @param id The primary key of the Source to archive
   * @param options The API options provided in the query string
   * @returns A promise containing the restored Source object
   */
  public async restore(organization: string, id: number, options: Types.ApiOptions = {}): Promise<Source> {
    this.connect();

    const eager = options.withTags ? 'tags' : '';
    const source: Source = await Source.query(this.connection)
      .updateAndFetchById(id, {
        archived: false,
        updated_at: new Date(),
      }).where('organization_id', organization);

    if (!source) {
      throw new ResourceNotFoundException();
    }

    return this.format(source, options);
  }
  //#endregion
  //#region Private Functions
  /**
   * Clean up a Source by parsing JSON, decrypting data, and handling query string options
   * @param source An unformatted Source from the database
   * @param options The API options provided in the query string
   * @returns A promise containing a formatted Source object
   */
  private async format(source: Source, options: Types.ApiOptions): Promise<Source> {
    source.parseJson();

    if (source.form) {
      source.embed = this.formbuilder.embedProperties(source.api_key);
    } else {
      source.embed = {};
    }
    // TODO: Add POD counts back in if the DB is ever optimized enough to handle them.
    delete source.archived;
    delete source.theme_id;
    return source;
  }
  //#endregion
}

export default SourceController;
