/**
 * Exception that is thrown when a table is not set when doing a query
 */
class NullTableException extends Error {
  /**
   * Initializes a new NullTableException instance.
   * @param {string} [message] The message to display on the thrown exception
   */
  constructor(message = 'The NosQL table is null, are you forgetting ".setTable(table, primaryKey)"?') {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

module.exports = NullTableException;
