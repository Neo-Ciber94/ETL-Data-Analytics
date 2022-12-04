import { describe, expect, test } from "vitest";
import { MemoryCache } from "../../../src/caching/memory.cache";

describe("MemoryCache", () => {
  test("expected set and get a value", async () => {
    const cache = new MemoryCache<{ fruit: string }>(`fruits-${Date.now()}`);

    await cache.set("red", { fruit: "apple" });
    await cache.set("yellow", { fruit: "pineapple" });

    await expect(cache.get("red")).resolves.toStrictEqual({ fruit: "apple" });
    await expect(cache.get("yellow")).resolves.toStrictEqual({
      fruit: "pineapple",
    });

    await expect(cache.get("blue")).resolves.toBeNull();
  });
});
