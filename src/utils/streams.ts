/**
 * An alias over `AsyncGenerator<T>`.
 */
export type Stream<T> = AsyncGenerator<T>;

export namespace Stream {
  /**
   * Creates a stream from the given values.
   */
  export async function* from<T>(...values: T[]): Stream<T> {
    for (const value of values) {
      yield value;
    }
  }
}
