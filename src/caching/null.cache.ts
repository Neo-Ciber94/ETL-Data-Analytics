/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICache } from "./cache.interface";

/**
 * A cache that never stores a value.
 */
export class NullCache implements ICache<any> {
  get(_: string): Promise<any> {
    return Promise.resolve(null);
  }

  getAll(): Promise<any[]> {
    return Promise.resolve([]);
  }

  has(_: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  set(_: string, __: any): Promise<void> {
    return Promise.resolve();
  }

  remove(_: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  clear(): Promise<void> {
    return Promise.resolve();
  }
}

const instance = new NullCache();
export function getNullCache<T>(): ICache<T> {
  return instance;
}
