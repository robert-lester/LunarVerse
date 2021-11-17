/**
 * Interface for locks used by locking services
 * TODO: Implement a mock for the lock service, using this interface.
 */
export interface LockServiceLock {
  name: string;

  release(): Promise<void>;

  released: boolean;
}

/**
 * Interface for locking services so we can easily and consistently mock them
 */
export interface LockService {
  /**
   * Attempt to obtain a mutually-exclusive lock
   * @param name The name of the lock to request
   * @param lockTimeMS How long the lock can be valid, in milliseconds 
   */
  acquire(name: string, lockTimeMS: number): Promise<LockServiceLock>;

  /**
   * Close the connection to the lock store to prevent leaks in Lambda
   */
  disconnect(): Promise<void>;
}