export default interface IControllerDelete {
  delete(organization: string, id: any): Promise<void>;
}
