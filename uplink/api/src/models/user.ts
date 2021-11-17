import { Model } from 'objection';
import { PhoneNumber } from '.';
import { UserType } from '../@types';
/* tslint:disable:no-shadowed-variable */
export class User extends Model {
  public static tableName: string = 'users';
  public static idColumn: string = 'id';

  public static get relationMappings() {
    const { PhoneNumber } = require('./phoneNumber');
    return {
      phoneNumber: {
        relation: Model.HasOneRelation,
        modelClass: PhoneNumber,
        join: {
          from: 'users.id',
          to: 'phonenumbers.user_id',
        },
      },
    };
  }

  public get assigned(): boolean {
    return this.phoneNumber !== null;
  }

  public get color(): string {
    const color = ['red', 'pink', 'purple', 'deepPurple', 'indigo', 'blue', 'lightBlue', 'cyan', 'teal', 'green', 'lightGreen', 'lime', 'yellow', 'amber', 'orange', 'deepOrange', 'brown', 'grey', 'blueGrey'];
    return color[this.id % color.length];
  }

  public id: number;
  public physicalNumber: string;
  public organization_id: string;
  public type: UserType;
  public created_at: Date;
  public updated_at: Date;
  public name?: string;
  // TODO: Remove directDialNumber after it's been removed from the frontend
  public directDialNumber?: string;
  public phoneNumber?: PhoneNumber;

  // the JSON that is returned does not have the values of the getters, so they need
  // to be added in this function
  toJSON(): User {
    return Object.assign({color: this.color}, this);
  }
}
