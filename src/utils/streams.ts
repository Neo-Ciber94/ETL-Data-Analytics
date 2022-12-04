/* eslint-disable @typescript-eslint/no-namespace */
/**
 * An alias over `AsyncGenerator<T>`.
 */
export type Stream<T> = AsyncGenerator<T>;

export namespace Stream {
  /**
   * Creates a stream from the given values.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  export async function* from<T>(values: T[]): Stream<T> {
    for (const value of values) {
      yield value;
    }
  }
}
