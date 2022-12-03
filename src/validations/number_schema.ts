import { z } from "zod";

// https://github.com/colinhacks/zod/discussions/330#discussioncomment-3705981
const numericString = (schema: z.ZodTypeAny) =>
  z.preprocess((a) => {
    if (typeof a === "string") {
      return parseInt(a, 10);
    } else if (typeof a === "number") {
      return a;
    } else {
      return undefined;
    }
  }, schema) as z.ZodEffects<z.ZodTypeAny, number, number>;

export const numberSchema = numericString(z.number());
