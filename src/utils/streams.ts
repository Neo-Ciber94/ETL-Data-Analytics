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

  /**
   * Returns a stream with only the given number of values from the source stream.
   * @param source The stream.
   * @param count The number of items to take.
   */
  export async function* take<T>(source: Stream<T>, count: number): Stream<T> {
    let n = 0;

    for await (const value of source) {
      if (n++ < count) {
        yield value;
      } else {
        break;
      }
    }
  }
}
