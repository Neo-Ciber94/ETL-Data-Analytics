import { z } from "zod";

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || typeof arg === "number") {
    return new Date(arg);
  }

  if (arg instanceof Date) {
    return arg;
  }

  return undefined;
}, z.date().or(z.string().or(z.number())));
