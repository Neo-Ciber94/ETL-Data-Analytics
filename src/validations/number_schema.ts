import { z } from "zod";

export const numberSchema = z.preprocess((a) => {
  if (typeof a === "string") {
    return parseFloat(a);
  } else if (typeof a === "number") {
    return a;
  } else {
    return a;
  }
}, z.number());
