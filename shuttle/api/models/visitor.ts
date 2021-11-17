import { Model } from 'objection';
import * as uaParser from 'ua-parser-js';

export class Visitor extends Model {
  public static tableName: string = 'visitors';

  public static get relationMappings() {
    const { Event } = require('./event');
    const { Site } = require('./site');

    return {
      events: {
        relation: Model.HasManyRelation,
        modelClass: Event,
        join: {
          from: 'visitors.id',
          to: 'events.visitor_uid',
        },
      },
      site: {
        relation: Model.BelongsToOneRelation,
        modelClass: Site,
        join: {
          from: 'visitors.site_uid',
          to: 'sites.uid',
        },
      },
    };
  }

  public id: string;
  public site_uid: string;
  public lead_uid?: string;
  public fingerprint: string;
  public data: string;
  public created_at: Date | string;
  public updated_at: Date | string;

  public static buildAgent(userAgent) {
    const agent = JSON.parse(userAgent);
    const ua = uaParser(agent.user_agent);

    return {
      browser: ua.browser.name || '',
      browser_version: ua.browser.version || '',
      device: ua.device.type || 'Desktop',
      os: ua.os.name || '',
      os_version: ua.os.version || '',
      user_agent: agent.user_agent || '',
      id: agent.id || '',
    };
  }
}
