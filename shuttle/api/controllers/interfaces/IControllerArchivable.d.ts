import * as Types from '../../../@types';

export default interface IControllerArchivable {
  archive(organization: string, id: number): Promise<any>;
  restore(organization: string, id: number, options: Types.ApiOptions): Promise<any>;
}
