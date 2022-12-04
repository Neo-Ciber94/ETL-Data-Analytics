import { z } from "zod";
import { numberSchema } from "./number_schema.js";
import { transactionTypeSchema } from "./transaction_type_schema.js";

export type JsonTransaction = z.infer<typeof jsonTransactionSchema>;
export const jsonTransactionSchema = z.object({
  amount: numberSchema,
  price: numberSchema,
  total: numberSchema,
  account_id: z.number(),
  transaction_code: transactionTypeSchema,
  symbol: z
    .string()
    .min(1)
    .transform((e) => e.toLowerCase()),
});
