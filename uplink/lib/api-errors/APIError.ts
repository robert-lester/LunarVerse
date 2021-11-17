export default class APIError extends Error {
  constructor(message = '') {
    // TODO: Restrict this to enumerated error codes rather than allowing any message here.
    super(message);
  }
}
