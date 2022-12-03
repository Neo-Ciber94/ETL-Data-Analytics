import { z } from "zod";

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg === "number") {
    return new Date(arg);
  }

  if (typeof arg === "string") {
    const num = parseInt(arg, 10);
    if (Number.isNaN(num)) {
      return new Date(arg);
    } else {
      return new Date(num);
    }
  }

  if (arg instanceof Date) {
    return arg;
  }

  return arg;
}, z.date());
