import * as Types from '../../../@types';

export default interface IControllerIndex {
  index(organization: string, options: Types.ApiOptions): Promise<any[]>;
}
