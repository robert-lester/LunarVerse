import * as parseDomain from 'parse-domain';
import * as uuid from 'uuid/v4';

import Controller from './controller';
import HTTPException from '../../exceptions/HTTPException';
import { Site } from '../models';
import * as Types from '../../@types';

class SiteController extends Controller {
  /**
   * Creates a new Site object in the database
   * @param attributes contains the name and domain
   * @returns A promise containing the newly inserted Site
   */
  public async create(attributes): Promise<Site> {
    this.connect();

    const domain: Types.DomainParser = Site.parseDomain(attributes.domain);
    const uid: string = uuid();

    const insert: Site = Object.assign({}, attributes, {
      domain,
      uid,
      name: attributes.name,
      slug: attributes.name.toLowerCase().replace(/\s+/g, '-'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return Site.query(this.connection).insert(insert);
  }
}

export default SiteController;
