import { Model } from 'objection';
import * as generatePublicId from 'uuid/v4';

export default abstract class PublicFacingModel extends Model {
  public static idColumn: string = 'id';

  public $beforeInsert() {
    this.public_id = generatePublicId();
  }

  public readonly id: number;
  public public_id: string;
}