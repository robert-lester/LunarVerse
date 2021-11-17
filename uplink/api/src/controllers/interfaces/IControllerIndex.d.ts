export interface IControllerIndex<Model> {
  index(organization: string): Promise<Model[]>;
}
