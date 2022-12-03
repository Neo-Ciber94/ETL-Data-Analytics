import { z } from "zod";

export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const transactionTypeSchema = z
  .preprocess((arg) => {
    return typeof arg === "string" ? arg.toLowerCase() : arg;
  }, z.enum(["buy", "sell"]))
  .transform((s) => s.toLowerCase());
