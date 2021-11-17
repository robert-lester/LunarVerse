import * as moment from 'moment';
import { Model, Pojo } from 'objection';
import {
  DirectionType,
  MediaObject,
  MessageType,
} from '../@types';
import { Conversation, PhoneNumber } from './';
import PublicFacingModel from './public';
/* tslint:disable:no-shadowed-variable */

export class Message extends PublicFacingModel {
  public static tableName: string = 'messages';

  public static get relationMappings() {
    const { Conversation, PhoneNumber } = require('./');

    return {
      conversation: {
        join: {
          from: `${Message.tableName}.conversation_id`,
          to: `${Conversation.tableName}.id`,
        },
        modelClass: Conversation,
        relation: Model.BelongsToOneRelation,
      },
      phoneNumber: { // SENDING PHONE
        join: {
          from: `${Message.tableName}.from_phone_id`,
          to: `${PhoneNumber.tableName}.id`,
        },
        modelClass: PhoneNumber,
        relation: Model.BelongsToOneRelation,
      },
    };
  }

  public get phone_id() {
    return this.from_phone_id;
  }

  public get public_status() {
    if (
      this.call_status === 'INCOMPLETE' &&
      moment.utc(this.updated_at).diff(moment.utc(), 'hours') >= 4
    ) {
      return 'DROPPED';
    }
    return this.call_status;
  }

  public get recipient() {
    return JSON.parse(this.recipient_snapshot);
  }

  public get sender(){
    return JSON.parse(this.user);
  }

  // TODO: Remove this alias once we're sure everything is working properly
  public get user() {
    return this.sender_snapshot;
  }

  public static format(message: Message): Message {
    const m = message;
    if (m.media === null) {
      m.media = '[]';
    }

    m.media = JSON.parse(m.media as string);

    return m;
  }

  public $beforeInsert() {
    super.$beforeInsert();
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  public $beforeUpdate() {
    this.updated_at = new Date();
  }

  public $parseDatabaseJson(json: Pojo) {
    json = super.$parseDatabaseJson(json);
    // We don't publicly expose the primary key
    delete json.id;

    return json;
  }

  public billable_units: number;
  public call_completed_at: null|string;
  public call_dialed_at: null|string;
  public call_sid: null|string;
  public call_rang_at: null|string;
  public call_status: null|'BUSY'|'COMPLETED'|'FAILED'|'INCOMPLETE'|'NO_ANSWER';
  public call_started_at: null|string;
  public conversation_id: number;
  public created_at: Date;
  public direction: DirectionType;
  public duration: number;
  public from_phone_id: number;
  public media?: MediaObject[] | string;
  public message?: string;
  public organization_id: string;
  public to_phone_id: number;
  public type: MessageType;
  public updated_at: Date;
  public recipient_snapshot: null|string;
  public sender_snapshot: null|string;
  public origin: 'PHONE'|'WEB';

  public conversation?: Conversation;
  public phoneNumber?: PhoneNumber;
}
