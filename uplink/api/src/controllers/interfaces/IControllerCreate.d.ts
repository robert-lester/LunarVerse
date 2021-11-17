export interface IControllerCreate<Model> {
  create(organization: string, attributes: any): Promise<Model>;
}
