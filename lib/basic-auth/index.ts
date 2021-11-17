// NOTE: Basic Authentication is NOT secure. Only use over HTTPS!

export default abstract class BasicAuth {
  /**
   * Encode a header for use in Basic Auth authenticators
   * @param username
   * @param password
   */
  public static encode(username: string, password: string): string {
    return Buffer.from(`${username}:${password}`, 'ascii').toString('base64');
  }

  /**
   * Decompose a Basic Auth header to a username/password pair
   * @param header 
   */
  public static decode(header: string): [string, string] {
    const parts = Buffer.from(header, 'base64').toString('ascii').split(':');

    return [parts[0], parts[1] || ''];
  }
}