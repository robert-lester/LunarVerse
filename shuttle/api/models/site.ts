import * as parseDomain from 'parse-domain';
import { Model } from 'objection';

import HTTPException from '../../exceptions/HTTPException';
import * as Types from '../../@types';

export class Site extends Model {
  public static tableName: string = 'sites';

  public static get relationMappings() {
    const { Visitor } = require('./visitor');

    return {
      visitors: {
        relation: Model.HasManyRelation,
        modelClass: Visitor,
        join: {
          from: 'sites.uid',
          to: 'visitors.site_uid',
        },
      },
    };
  }

  public static parseDomain(url) {
    const parsedDomain: Types.DomainParser = parseDomain(url);

    if (parsedDomain === null) {
      throw new HTTPException('Invalid domain', 400);
    }

    if (!parsedDomain.subdomain || parsedDomain.subdomain === 'www') {
      url = `${parsedDomain.domain}.${parsedDomain.tld}`;
    } else {
      url = `${parsedDomain.subdomain}.${parsedDomain.domain}.${parsedDomain.tld}`;
    }

    return url;
  }

  public uid: string;
  public name: string;
  public domain: string;
  public slug?: string;
  public created_at: Date | string;
  public updated_at?: Date | string;
  public group_uid?: string;
  public is_hipaa?: number;
  public amp_base_config?: string;
}
