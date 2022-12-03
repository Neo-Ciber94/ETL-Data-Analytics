/**
 * An error result.
 */
export interface ResultError<TError> {
  readonly error: TError;
  readonly type: "error";
}

/**
 * A successful result.
 */
export interface ResultOk<T> {
  readonly data: T;
  readonly type: "success";
}

/**
 * A type that represents a success or failed of an operation.
 */
export type Result<T, TError> = ResultOk<T> | ResultError<TError>;

export namespace Result {
  export function ok<T>(data: T): Result<T, never> {
    return {
      data,
      type: "success",
    };
  }

  export function error<TError>(error: TError): Result<never, TError> {
    return {
      error,
      type: "error",
    };
  }
}
