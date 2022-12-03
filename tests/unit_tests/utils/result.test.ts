import { describe, expect, test } from "vitest";
import { Result } from "../../../src/utils/result";

describe("Result type", () => {
  test("expected successful result", () => {
    const value = Result.ok({ value: 20 });
    expect(value.type).toBe("success");
    expect((value as any).data).toStrictEqual({ value: 20 });
  });

  test("expected error result", () => {
    const value = Result.error("Invalid transaction");
    expect(value.type).toBe("error");
    expect((value as any).error).toStrictEqual("Invalid transaction");
  });
});
