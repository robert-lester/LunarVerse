export interface IControllerDelete {
  delete(organization: string, id: number): Promise<boolean>;
}
