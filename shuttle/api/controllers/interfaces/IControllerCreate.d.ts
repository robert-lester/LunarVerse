import * as Types from '../../../@types';

export default interface IControllerCreate {
  create(organization: string, data: any, options: Types.ApiOptions): Promise<any>;
}
