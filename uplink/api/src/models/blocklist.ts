import { Model } from 'objection';
import { User } from './user';

export class BlockList extends Model {
  public static tableName: string = 'blocklist';
  public static fromIdColumn: string = 'from_user_id';
  public static toIdColumn: string = 'to_user_id';

  public static get relationMappings() {

    return {
      fromUser: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'blocklist.from_user_id',
          to: 'users.id',
        },
      },
      toUser: {
        relation: Model.HasOneRelation,
        modelClass: User,
        join: {
          from: 'blocklist.to_user_id',
          to: 'users.id',
        },
      }
    };
  }

  public $beforeInsert() {
    this.created_at = new Date().toISOString();
  }

  public $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  public from_user_id: number;
  public to_user_id: number;
  public blocked: boolean;
  public organization_id: string;
  public created_at: string;
  public updated_at: string;
}
