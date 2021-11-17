import { Model } from 'objection';
import * as Types from '../../intake/index';

export class Event extends Model {
  public static tableName: string = 'events';

  public static get relationMappings() {
    const { Visitor } = require('./visitor');

    return {
      visitor: {
        relation: Model.BelongsToOneRelation,
        modelClass: Visitor,
        join: {
          from: 'events.visitor_uid',
          to: 'visitors.id'
        },
      },
    };
  }

  public uid: string;
  public visitor_uid: string;
  public visit_uid: string;
  public type_id: number;
  public site_uid: string;
  public data: string;
  public event_uid?: string;
  public created_at: Date | string;
  public updated_at?: Date | string;

  public static buildEventComplexPath (event: Types.TelescopeEvent) {
    const newEvent: Types.TelescopeEvent = event;

    const eventData: Types.TelescopeEventData = JSON.parse(newEvent.data as string);

    switch (newEvent.type_id) {
      case 1: // Load
        if (eventData.current_url) {
          return eventData.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, '');
        }
        return '';
      case 2: // Unload
        if (eventData.current_url) {
          return eventData.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Unload - ');
        }
        return '';
      case 3:
        if (eventData.current_url && (eventData.element || { html: '' }).html) {
          return `Click (<${eventData.element.html.replace(/"/g, "'")}>) - ${eventData.current_url.replace(/http.?:\/\/www\..+\.(com|org)/, '')}`;
        }
        return 'No HTML path';
      case 4:
        return 'Form Fillout';
      case 5:
        if (eventData.current_url) {
          return eventData.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Phone Call');
        }
        return 'Phone Call';
      case 6:
        if (eventData.current_url) {
          return eventData.current_url.replace(/http.?:\/\/www\..+?\.(com|org|net)/, 'Chat');
        }
        return 'Chat';
      default:
        console.error(`Invalid event type ID "${newEvent.type_id}"`);
  
        return '';
    }
  };
}