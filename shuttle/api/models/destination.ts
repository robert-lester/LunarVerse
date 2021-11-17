import { Model } from 'objection';
import { default as Airlock } from '../../../lib/airlock/Airlock';
import { Response, Tag } from '.';

/* tslint:disable:no-shadowed-variable */
export class Destination extends Model {
  public static tableName: string = 'destinations';
  public static idColumn: string = 'id';

  public static get relationMappings() {
    const { Response } = require('./response');
    const { Tag } = require('./tag');

    return {
      responses: {
        relation: Model.HasManyRelation,
        modelClass: Response,
        join: {
          from: 'destinations.id',
          to: 'responses.destination_id',
        },
      },
      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: 'destinations.id',
          through: {
            from: 'destinations_tags.destination_id',
            to: 'destinations_tags.tag_id',
          },
          to: 'tags.id',
        },
      },
    };
  }

  public static stringifyJson(destination: Destination): Destination {
    if (destination.config) {
      destination.config = JSON.stringify(destination.config);
    }
    if (destination.mapping) {
      destination.mapping = JSON.stringify(destination.mapping);
    }
    if (destination.validation) {
      destination.validation = JSON.stringify(destination.validation);
    }
    return destination;
  }

  public static setDefaults(destination: Destination): Destination {
    if (!destination.config) {
      destination.config = '{}';
    }
    if (!destination.mapping) {
      destination.mapping = '{}';
    }
    if (!destination.validation) {
      destination.validation = '{}';
    }
    return destination;
  }

  public static async decryptConfig(destination: Destination) {
    if (destination.encryption_version === 2) {
      return destination.config;
    }

    try {
      const buffer = Buffer.from(destination.config, 'base64');
      return await new Airlock(
        `alias/shuttle/airlock/${process.env.STAGE}/${destination.organization_id}`,
      ).decrypt(buffer);
    } catch (err) {
      console.error(err.stack);

      return { error: 'Failed to decrypt config' };
    }
  }

  public static async encryptConfig(destination: Destination) {
    return (await new Airlock(
      `alias/shuttle/airlock/${process.env.STAGE}/${destination.organization_id}`,
    ).encrypt(destination.config)).toString('base64');
  }

  public id?: number;
  public name: string;
  public organization_id: string;
  public type: string;
  public config: string | any;
  public encryption_version: number;
  public mapping: string | any;
  public validation: string | any;
  public archived: boolean;
  public created_at: Date;
  public updated_at: Date;
  public tags?: Tag[];
  public responses?: Response[];

  // TODO: Remove?
  public podsLastWeek?: number;
  public podsLastMonth?: number;
  public podsLastYear?: number;

  public parseJson(): void {
    try {
      this.config = JSON.parse(this.config);
    } catch (e) {
      this.config = {};
    }
    try {
      this.mapping = JSON.parse(this.mapping);
    } catch (e) {
      this.mapping = {};
    }
    try {
      this.validation = JSON.parse(this.validation);
    } catch (e) {
      this.validation = {};
    }
  }
}
