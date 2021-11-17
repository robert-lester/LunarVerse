export default class HTTPException extends Error {
  constructor(message: string, private statusCode: number) {
    super(message);
  }
}
