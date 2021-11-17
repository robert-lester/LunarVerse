import * as Types from '../../../@types';
import { Pod } from '../../models';

export interface IPodPaginate {
  total: number;
  results: Pod[];
  page: number;
  toTimestamp?: string;
}
export default interface IControllerPaginate {
  paginate(organization: string, options: Types.ApiOptions): Promise<IPodPaginate>;
}
