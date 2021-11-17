export default interface RocketResponse {
  status: number,
  raw: {
    error?: string,
    status?: number,
    statusText?: string,
    response: any,
    message?: string,
  }
  destinationId?: number,
}