import { Model } from 'objection';
import { PhoneType } from '../@types';
import { Message, User, Conversation } from './index';
/* tslint:disable:no-shadowed-variable */
export class PhoneNumber extends Model {
  public static tableName: string = 'phonenumbers';
  public static idColumn: string = 'id';

  public static get relationMappings() {
    const { Message } = require('./message');
    const { User } = require('./user');
    const { PhoneNumber } = require('./phoneNumber');

    return {
      forward: {
        relation: Model.BelongsToOneRelation,
        modelClass: PhoneNumber,
        join: {
          from: 'phonenumbers.id',
          to: 'phonenumbers.forward_id'
        }
      },
      messages: {
        relation: Model.HasManyRelation,
        modelClass: Message,
        join: {
          from: 'phonenumbers.id',
          to: 'messages.from_phone_id',
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'phonenumbers.user_id',
          to: 'users.id'
        }
      },
    };
  }

  // NOTE: The next two methods are necessary to ensure inserts and updates
  // always keep created_at and updated_at consistent
  public $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  public $beforeUpdate() {
    this.updated_at = new Date();
  }

  public get hasConversations(): boolean {
    return this.conversations.length > 0;
  }

  public get isAssigned(): boolean {
    return (this.user_id !== null || this.forward_id !== null);
  }

  public get callOrText30Days(): boolean {
    if (!this.last_communication){
      return false;
    }
    if (this.type === PhoneType.UNASSIGNED) {
      const oneDay = 24 * 60 * 60 * 1000;
      const now = new Date();
      const diffDays = Math.round(Math.abs((now.getTime() - this.last_communication.getTime()) / (oneDay)));
      return diffDays <= 30;
    }
    return false;
  }

  public id: number;
  public systemNumber: string;
  public sid: string;
  public created_at: Date;
  public updated_at: Date;
  public last_communication: Date;
  public notified: boolean;
  public organization_id: string;
  public type: PhoneType;
  public forward?: PhoneNumber;
  public forward_id: number;
  public user_id: number;
  public messages?: Message[];
  public user?: User;
  public conversations: Conversation[];
  public activityCount?: number;
  public contact_user_id?: number;
  public conversationDate?: Date;
}
