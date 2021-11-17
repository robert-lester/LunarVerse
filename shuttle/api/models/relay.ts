import { Model } from 'objection';

export class Relay extends Model {
  public static tableName: string = 'fields';
  public static idColumn: string = 'id';

  public name: string;
  public organization_id: string;
  public archived: boolean;
  public created_at: Date;
  public updated_at: Date;
}
