import * as Types from '../../../@types';

export default interface IControllerIndex {
  update(organization: string, data: any, options: Types.ApiOptions): Promise<any>;
}
