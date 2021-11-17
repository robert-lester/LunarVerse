export interface IControllerUpdate<Model> {
  update(organization: string, attributes: any): Promise<Model>;
}
