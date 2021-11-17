import { createClient, RedisClient } from 'redis';
import * as Redlock from 'redlock';
import { LockService, LockServiceLock } from '../@types';

const REDLOCK_DEFAULT_PORT = '6379';

class RedlockServiceLock implements LockServiceLock {
  private _released = false;

  public constructor(private redlockLock: Redlock.Lock, public name: string) {}

  public async release() {
    await this.redlockLock.unlock();
    this._released = true;
  }

  public get released() {
    return this._released;
  }
}

export class RedlockService implements LockService {
  private redlock: Redlock;

  public constructor(clientEndpointStrings: string[]) {
    if (clientEndpointStrings.length < 1) {
      throw new RangeError('Redlock needs at least one Redis client to function');
    } else if (clientEndpointStrings.length % 2 !== 1) {
      throw new RangeError('There must be an odd number of Redis clients in order to achieve Redlock consensus.');
    }
    const clients = clientEndpointStrings.map((endpointString, idx) => {
      const [host, stringPort] = endpointString.split(':');
      const port = parseInt(stringPort || REDLOCK_DEFAULT_PORT, 10);

      if (!Number.isInteger(port) || port < 1) {
        throw new TypeError(`The second half of Redis endpoint string #${idx} should be a non-zero positive integer. Instead, it is ${stringPort}`);
      }
      const client = createClient({ host, port });

      if (!(client instanceof RedisClient)) {
        throw new Error(`Failed to instantiate Redlock client #${idx}`);
      }
      return client;
    });
    this.redlock = new Redlock(clients);
  }

  public async acquire(name: string, lockTime: number) {
    const redlockLock = await this.redlock.lock(name, lockTime);

    return new RedlockServiceLock(redlockLock, name);
  }

  public async disconnect() {
    // TODO: Remove the "any" here after Redlock's typings are fixed to include
    // the quit() method.
    await (this.redlock as any).quit();
  }
}