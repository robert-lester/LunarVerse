import { Model } from 'objection';
import { Tag } from '.';

/* tslint:disable:no-shadowed-variable */
export class Source extends Model {
  public static tableName: string = 'sources';
  public static idColumn: string = 'id';

  public static get relationMappings() {
    const { Tag } = require('./tag');
    const { Pod } = require('./pod');
    return {
      tags: {
        relation: Model.ManyToManyRelation,
        modelClass: Tag,
        join: {
          from: 'sources.id',
          through: {
            from: 'sources_tags.source_id',
            to: 'sources_tags.tag_id',
          },
          to: 'tags.id',
        },
      },
      pods: {
        relation: Model.HasManyRelation,
        modelClass: Pod,
        join: {
          from: 'sources.id',
          to: 'pods.source_id',
        },
      },
    };
  }

  public static stringifyJson(source: Source): Source {
    if (source.mapping) {
      source.mapping = JSON.stringify(source.mapping);
    }
    if (source.fields) {
      source.fields = JSON.stringify(source.fields);
    }
    if (source.router) {
      source.router = JSON.stringify(source.router);
    }
    if (source.form) {
      source.form = JSON.stringify(source.form);
    }
    return source;
  }

  public static setDefaults(source: Source): Source {
    source.mapping = source.mapping ? JSON.stringify(source.mapping) : (source.mapping = '{}');
    source.fields = source.fields ? JSON.stringify(source.fields) : (source.fields = '[]');
    source.router = source.router ? JSON.stringify(source.router) : (source.router = '[]');
    return source;
  }

  public id?: number;
  public api_key?: string;
  public name: string;
  public organization_id: string;
  public mapping: string | any;
  public fields: string | any;
  public router: string | any;
  public archived: boolean;
  public created_at: Date;
  public updated_at: Date;
  public form?: string | any;
  public embed?: any;
  public tags?: Tag[];
  public theme_id?: string; // TODO: Remove this with a migration

  public podsLastMonth?: number;
  public podsLastWeek?: number;
  public podsLastYear?: number;

  public parseJson(): void {
    try {
      this.mapping = this.mapping === null ? {} : JSON.parse(this.mapping);
    } catch (e) {
      this.mapping = {};
    }
    try {
      this.fields = this.fields === null ? [] : JSON.parse(this.fields);
    } catch (e) {
      this.fields = [];
    }
    try {
      this.router = this.router === null ? [] : JSON.parse(this.router);
    } catch (e) {
      this.router = [];
    }
    try {
      this.form = JSON.parse(this.form);
    } catch (e) {
      this.form = {
        layout: [],
        theme: {
          'background-color': '#ffffff',
          'button-color': '#cccccc',
          'font-color': '#000000',
          'font-family': 'Arial, Helvetica, sans-serif',
          'font-size': '16px',
        },
      };
    }

    if (this.form === null) {
      this.form = {
        layout: [],
        theme: {
          'background-color': '#ffffff',
          'button-color': '#cccccc',
          'font-color': '#000000',
          'font-family': 'Arial, Helvetica, sans-serif',
          'font-size': '16px',
        },
      };
    }
  }
}
