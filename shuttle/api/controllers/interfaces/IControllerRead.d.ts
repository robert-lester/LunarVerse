import * as Types from '../../../@types';

export default interface IControllerIndex {
  read(organization: string, id: number, options: Types.ApiOptions): Promise<any>;
}
