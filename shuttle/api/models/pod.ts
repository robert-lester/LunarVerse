import { Model } from 'objection';
import { default as Airlock } from '../../../lib/airlock/Airlock';
import { Response } from '.';

/* tslint:disable:no-shadowed-variable */
export class Pod extends Model {
  public static tableName: string = 'pods';
  public static idColumn: string = 'id';

  public static get relationMappings() {
    const { Response } = require('./response');
    return {
      responses: {
        relation: Model.HasManyRelation,
        modelClass: Response,
        join: {
          from: 'pods.id',
          to: 'responses.pod_id',
        },
      },
    };
  }

  public static async decrypt(pod: Pod, stage: string = process.env.STAGE): Promise<Pod> {
    const lock: Airlock = new Airlock(`alias/shuttle/airlock/${stage}/${pod.organization_id}`);

    try {
      if (pod.encryption_version !== 2) {
        const plaintext = await lock.decrypt(pod.encrypted);
        pod.data = JSON.parse(plaintext);
      } else {
        pod.data = JSON.parse(pod.data);
      }
      pod.metadata = JSON.parse(pod.metadata);
    } catch (err) {
      console.error(err.stack);

      pod.data = { error: 'Failed to decrypt data. Please contact support.' };
    }
    delete pod.encrypted;
    return pod;
  }

  public id?: number;
  public organization_id: string;
  public source_id: number;
  public data?: any;
  public encrypted?: Buffer;
  public encryption_version: number;
  public metadata: any;
  public created_at: Date|string;
  public updated_at: Date|string;
  public responses: Response[];
  public telescope?: any;
}
