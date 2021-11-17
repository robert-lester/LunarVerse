import debug from 'debug';

export interface LogMethod {
  (message: string, ...additionalMessages: any[]): void;
}

/**
 *  Handle all interactions and authentication with salesforce
 * @alias module:Logger
 */
class Logger {
  private logger: debug;

  /**
   * Creates instance of the logger object
   * 
   * TODO: Align PIDs globally with real process identifiers
   * 
   * @param identifier Namespace identifier for logger
   * @param pid Optional process identifier
   */
  constructor(identifier: string, pid = '') {
    this.logger = debug(`${pid ? `${pid}:`: ''}${identifier}`);

    if (!!process.env.LOG) {
      this.logger.enabled = true;
    }
  }

  /**
   * Logs the specified message, or formats an objects in the logger if supplied
   * @param message Message to be logged
   * @param additionalMessages
   */
  public log: LogMethod = (message, ...additionalMessages) => {
    if (additionalMessages.length) {
      additionalMessages.map(m => this.logger(`--${message}`, m));
    } else {
      this.logger(`--${message}`);
    }
  }

  /**
   * The most important logging
   * @param message Message to be logged
   */
  formattedLog(message: string): void {
    let m = message
      .split('')
      .map(l => l.toUpperCase())
      .join(' 👏  ');
    this.logger(`--${m}`);
  }
}

/**
 * A module to handle all authentication with salesforce
 * @module Logger
 */
export default Logger;
