import { z } from "zod";

const ENUM_VALUES = ["buy", "sell"] as const;
type _EnumType = typeof ENUM_VALUES;

export type TransactionType = _EnumType[number];

// FIXME: We are repeating twice the enum values
type _Type = z.ZodEffects<z.ZodEnum<["buy", "sell"]>, TransactionType, unknown>;

export const transactionTypeSchema = z
  .preprocess((arg) => {
    return typeof arg === "string" ? arg.toLowerCase() : arg;
  }, z.enum(ENUM_VALUES))
  .transform((s) => s.toLowerCase()) as unknown as _Type;
