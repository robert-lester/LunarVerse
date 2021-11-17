import { Model } from 'objection';
import { Message, PhoneNumber, User } from './index';
import PublicFacingModel from './public';
/* tslint:disable:no-shadowed-variable */

export class Conversation extends PublicFacingModel {
  public static tableName: string = 'conversations';

  public static get relationMappings() {
    const { PhoneNumber } = require('./phoneNumber');
    const { Message } = require('./message');
    const { User } = require('./user');

    return {
      contactUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'users.id',
          to: 'conversations.contact_user_id'
        }
      },
      userPhone: {
        relation: Model.BelongsToOneRelation,
        modelClass: PhoneNumber,
        join: {
          from: 'phonenumbers.id',
          to: 'conversations.user_phone_id'
        }
      },
      messages: {
        relation: Model.HasManyRelation,
        modelClass: Message,
        join: {
          from: 'conversations.id',
          to: 'messages.conversation_id',
        },
      },
    };
  }

  public organization_id: string;
  public created_at: Date;
  public updated_at: Date;
  public messages?: Message[];
  public user_phone_id: number;
  public contact_user_id: number;
  public userPhone?: PhoneNumber;
  public contactUser?: User;
  public conversation_last_started_at?: Date;
}
