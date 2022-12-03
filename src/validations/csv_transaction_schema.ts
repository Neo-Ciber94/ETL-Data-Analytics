import { z } from "zod";
import { numberSchema } from "./number_schema.js";
import { transactionTypeSchema } from "./xml_transaction_schema.js";

export type CsvTransaction = z.infer<typeof csvTransactionSchema>;
export const csvTransactionSchema = z.object({
  date: z.string(),
  total: numberSchema,
  total_stock: numberSchema,
  stock_price: numberSchema,
  company: z.string(),
  transaction_type: transactionTypeSchema,
  email: z.string(),
});
