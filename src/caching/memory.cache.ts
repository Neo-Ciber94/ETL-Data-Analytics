import { ICache, ParsingOptions } from "./cache.interface";

const CACHES: Record<string, Map<string, string>> = {};

export class MemoryCache<T> implements ICache<T> {
  private readonly map: Map<string, string>;

  /**
   * Removes all the entries in all the available caches.
   */
  static purgeAllCaches() {
    for (const map of Object.values(CACHES)) {
      map.clear();
    }
  }

  // /**
  //  * Calculates the number of bytes used in all the available caches.
  //  * @returns The number of bytes used in all the caches.
  //  */
  // static get bytesUsed(): number {
  //   // FIXME: This is retuning 16 bytes always
  //   const size = Buffer.byteLength(JSON.stringify(CACHES))
  //   return size;
  // }

  constructor(
    readonly baseKey: string,
    readonly parser: ParsingOptions<T> = {
      parse: JSON.parse,
      stringify: JSON.stringify,
    }
  ) {
    if (CACHES[baseKey] == null) {
      CACHES[baseKey] = new Map();
    }

    this.map = CACHES[baseKey]!;
  }

  get(key: string): Promise<T | null> {
    const json = this.map.get(key);
    if (json == null) {
      return Promise.resolve(null);
    }

    const data = parseOrNull(json, this.parser);
    return Promise.resolve(data);
  }

  getAll(): Promise<T[]> {
    const json = this.map.values();
    const results = Array.from(json)
      .map((s) => parseOrNull<T>(s, this.parser)!)
      .filter((e) => e != null);

    return Promise.resolve(results!);
  }

  set(key: string, value: T): Promise<void> {
    const json = this.parser.stringify(value);
    this.map.set(key, json);
    return Promise.resolve();
  }

  has(key: string): Promise<boolean> {
    const result = this.map.has(key);
    return Promise.resolve(result);
  }

  remove(key: string): Promise<boolean> {
    const result = this.map.delete(key);
    return Promise.resolve(result);
  }

  clear(): Promise<void> {
    this.map.clear();
    return Promise.resolve();
  }
}

function parseOrNull<T>(
  s: string | null | undefined,
  parser: ParsingOptions<T>
): T | null {
  if (s == null) {
    return null;
  }

  try {
    return parser.parse(s);
  } catch {
    return null;
  }
}
