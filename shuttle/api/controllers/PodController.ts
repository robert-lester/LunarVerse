import { flatten } from 'flat';

import * as Observatory from '../../../lib/observatory';

import Controller from './Controller';
import { Pod, Response } from '../models';
import HTTPException from '../../exceptions/HTTPException';

import * as Types from '../../@types';
import { IControllerPaginate, IControllerCreate, IControllerRead } from './interfaces';
import { IPodPaginate } from './interfaces/IControllerPaginate';

class PodController extends Controller implements IControllerPaginate, IControllerCreate, IControllerRead {
  //#region Public Functions
  /**
   * Paginate across Pods in batches defined by the options
   * @param organization The organization the Pods belong to
   * @param options The Pod API options provided in the query string
   * @returns A promise containing a Pod array of a given page
   */
  public async paginate(organization: string, options: Types.PodApiOptions = {}): Promise<IPodPaginate> {
    this.connect();
    const { current, pageSize, sources, destinations, errors } = options;
    const start = Math.max(0, (current - 1)) * pageSize;
    const end = current < 1 ? 0 : current * pageSize;

    const res = await Pod.query(this.connection)
      .where('organization_id', organization)
      .modify((builder) => {
        if (sources.length) {
          builder.whereIn('source_id', sources);
        }
      })
      .orderBy('id', 'desc')
      .range(start, end)
      .eager('responses')
      .modifyEager('responses', (builder) => {
        if (destinations.length) {
          builder.whereIn('destination_id', destinations);
        }

        if (errors) {
          builder.andWhere('status_code', '>', 399);
        }
      });

    const { results, total }: { results: Pod[], total: number } = res;
    for (let x = 0; x < results.length; x++) {
      results[x] = this.format(results[x]);
    }

    return {
      total,
      page: typeof current === 'string' ? parseInt(current, 10) : current,
      results: end > start ? results : [],
    };
  }

  /**
   * Create a new Pod object in the database
   * @param organization The organization the Pod belongs to
   * @param data The data to assign to the Pod row
   * @param options The Pod API options provided in the query string
   * @returns A promise containing the newly inserted Pod
   */
  public async create(organization: string, data: Pod, options: Types.PodApiOptions = {}): Promise<Pod> {
    this.connect();

    const insert: Pod = Object.assign(data, {
      created_at: new Date(),
      organization_id: organization,
      updated_at: new Date(),
    });

    const result: Pod = await Pod.query(this.connection)
      .insertAndFetch(insert)
      .first();

    return result;
  }

  /**
   * Retrieve an individual Pod from the database given an ID
   * @param organization The organization the Pod belongs to
   * @param id The primary key of the Pod
   * @param options The Pod API options provided in the query string
   * @returns A promise containing the Pod with the primary key provided
   */
  public async read(organization: string, id: number, options: Types.PodApiOptions = {}): Promise<Pod> {
    this.connect();

    const pod: Pod =  await Pod.query(this.connection)
      .where('organization_id', organization)
      .findById(id)
      .eager('responses');

    if (!pod) {
      throw new HTTPException('', 404);
    }
    const formatted = this.format(await Pod.decrypt(pod));

    formatted.telescope = {};
    formatted.responses = formatted.responses.map((response) => Response.format(response));

    if ((formatted.metadata.telescope || {}).visit_uid !== '') {
      formatted.telescope = await new Observatory(process.env.TELESCOPE_URL).getVisitById(formatted.metadata.telescope.visit_uid);
    }

    return formatted;
  }
  //#endregion
  //#region Private Functions
  /**
   * Clean up the Pod by parsing JSON and deleting un-needed encrypted fields
   * @param pod An unformatted Pod from the database
   * @returns A formatted Pod object
   */
  private format(pod: Pod): Pod {
    delete pod.encrypted;
    delete pod.encryption_version;
    delete pod.organization_id;
    delete pod.updated_at;

    try {
      pod.metadata = JSON.parse(pod.metadata);
    } catch (err) {
      console.error('Error parsing JSON');
    }

    if (!pod.responses) {
      pod.responses = [];
    }

    for (let x = 0; x < pod.responses.length; x++) {
      pod.responses[x].parseJson();
    }
    // TODO: Remove if statement when encryption is removed
    if (pod.data === null || pod.data === undefined) {
      pod.data = {};
    }

    pod.data = flatten(pod.data);

    pod.data = Object.keys(pod.data).reduce((acc, key) => {
      if (pod.data[key] === null) {
        acc[key] = 'null';
      } else if (typeof pod.data[key] === 'string') {
        acc[key] = `"${pod.data[key]}"`;
      } else {
        acc[key] = pod.data[key].toString();
      }

      return acc;
    }, {});

    return pod;
  }
  //#endregion
}

export default PodController;
