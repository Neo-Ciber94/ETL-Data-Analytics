import { z } from "zod";

const TYPES = ["buy", "sell"] as const;

export type TransactionType = typeof TYPES[number];

export const transactionTypeSchema = z
  .enum(TYPES)
  .refine((arg) => TYPES.includes(arg.toLowerCase() as TransactionType));
