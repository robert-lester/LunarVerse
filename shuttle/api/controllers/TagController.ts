import Controller from './Controller';
import { Source, Tag, Destination } from '../models';

import * as Types from '../../@types';

class TagController extends Controller {
  //#region Public Functions
  /**
   * Retrieve all Tags in a given organization
   * @param organization The organization the Tags belong to
   * @param options The API options provided in the query string
   * @returns A promise containing a Tag array of all Tags for an organization
   */
  public async index(organization: string, options: Types.ApiOptions = {}): Promise<Tag[]> {
    this.connect();

    const eager: string = `[
      ${options.withSources ? 'sources' : ''}
      ${options.withSources && options.withDestinations ? ',' : ''}
      ${options.withDestinations ? 'destinations' : ''}
    ]`.trim();

    const results: Tag[] = await Tag.query(this.connection)
      .where('organization_id', organization)
      .eager(eager);

    if (options.withSources) {
      results.forEach((tag: Tag) => {
        if (tag.sources) {
          tag.sources.forEach((source: Source) => {
            source.parseJson();
          });
        }
      });
    }
    if (options.withDestinations) {
      results.forEach((tag: Tag) => {
        if (tag.destinations) {
          tag.destinations.forEach((destination: Destination) => {
            destination.parseJson();
          });
        }
      });
    }
    return results;
  }

  /**
   * Create a new Tag object in the database
   * @param organization The organization the Tag belongs to
   * @param data The data to assign to the Tag row
   * @param options The API options provided in the query string
   * @returns A promise containing the newly inserted Tag
   */
  public async create(organization: string, data: Tag, options: Types.ApiOptions = {}): Promise<Tag> {
    this.connect();

    const insert: Tag = Object.assign(data, {
      created_at: new Date(),
      organization_id: organization,
      updated_at: new Date(),
    });

    return Tag.query(this.connection).insertAndFetch(insert);
  }

  /**
   * Permanently deletes a Tag(s) from the database given an ID and an organization
   * @param organization  The organization the Tag(s) belongs to
   * @param id The primary key of the Tag(s) to delete. Can also be an Array
   * @returns a Promise with an empty object
   */
  public async delete(organization: string, id: number|number[]): Promise<any> {
    this.connect();

    if (id.constructor === Array) {
      return this.deleteMultiple(organization, id as number[]);
    } else {
      return this.deleteSingle(organization, id as number);
    }
  }
  //#endregion
  //#region Private Functions
  /**
   * Private helper function to permanently delete a single Tag from the database
   * @param organization The organization the Tag belongs to
   * @param id The primary key of the Tag to delete
   */
  private async deleteSingle(organization: string, id: number): Promise<any> {
    const tag = await Tag.query(this.connection)
      .where('organization_id', organization)
      .findById(id);

    await tag.$relatedQuery('sources', this.connection).unrelate();
    await tag.$relatedQuery('destinations', this.connection).unrelate();
    await Tag.query(this.connection).deleteById(id);
    return {};
  }

  /**
   * Private helper function to permanently delete a multiple Tags from the database
   * @param organization The organization the Tags belong to
   * @param id An array of primary keys of the Tags to delete
   */
  private async deleteMultiple(organization: string, arr: number[]): Promise<any> {
    await this.connection.raw(`
      DELETE FROM destinations_tags
      WHERE tag_id in ?
    `, arr);
    await this.connection.raw(`
      DELETE FROM sources_tags
      WHERE tag_id in ?
    `, arr);
    return Tag.query(this.connection).delete().whereIn('id', arr);
  }
  //#endregion
}

export default TagController;
