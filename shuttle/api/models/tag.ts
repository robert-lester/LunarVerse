import { Model } from 'objection';
import { Destination, Source } from '.';

/* tslint:disable:no-shadowed-variable */
export class Tag extends Model {
  public static tableName: string = 'tags';
  public static idColumn: string = 'id';

  public static get relationMappings() {
    const { Destination } = require('./destination');
    const { Source } = require('./source');

    return {
      destinations: {
        relation: Model.ManyToManyRelation,
        modelClass: Destination,
        join: {
          from: 'tags.id',
          through: {
            from: 'destinations_tags.tag_id',
            to: 'destinations_tags.destination_id',
          },
          to: 'destinations.id',
        },
      },
      sources: {
        relation: Model.ManyToManyRelation,
        modelClass: Source,
        join: {
          from: 'tags.id',
          through: {
            from: 'sources_tags.tag_id',
            to: 'sources_tags.source_id',
          },
          to: 'sources.id',
        },
      },
    };
  }

  public id?: number;
  public name: string;
  public organization_id: string;
  public created_at: Date;
  public updated_at: Date;
  public sources?: Source[];
  public destinations?: Destination[];
}
