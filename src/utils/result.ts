/**
 * A type that represents a success or failed of an operation.
 */
export class Result<T, TError> {
  private constructor(
    private readonly _value: unknown,
    private readonly _type: "success" | "error"
  ) {}

  public static ok<T>(value: T): Result<T, never> {
    return new Result(value, "success");
  }

  public static error<TError>(error: TError): Result<never, TError> {
    return new Result(error, "error");
  }

  get isError(): boolean {
    return this._type === "error";
  }

  get isSuccess(): boolean {
    return this._type === "success";
  }

  get value(): T {
    if (this.isError) {
      throw new Error("value was an error");
    }

    return this._value as T;
  }

  get error(): TError {
    if (this.isSuccess) {
      throw new Error("value was a success");
    }

    return this._value as TError;
  }
}
