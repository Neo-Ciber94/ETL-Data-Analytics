/**
 * Defines how to parse and stringify a value.
 */
export interface ParsingOptions<T> {
  readonly stringify: (value: T) => string;
  readonly parse: (json: string) => T;
}

/**
 * Represents a cache implementation.
 */
export interface ICache<T> {
  /**
   * Gets a value from the cache with the given key.
   */
  get(key: string): Promise<T | null>;

  /**
   * Get all the values from the cache.
   */
  getAll(): Promise<T[]>;

  /**
   * Check if the given key exists in the cache.
   * @param key The key to search.
   */
  has(key: string): Promise<boolean>;

  /**
   * Adds or update a value in the cache with the given key.
   * @param key The key.
   * @param value The value.
   */
  set(key: string, value: T): Promise<void>;

  /**
   * Removes the value associated with the given key.
   * @param key The key to remove.
   */
  remove(key: string): Promise<boolean>;

  /**
   * Removes all the entries in this cache.
   */
  clear(): Promise<void>;
}
