import { z } from "zod";
import { dateSchema } from "./date_schema.js";
import { numberSchema } from "./number_schema.js";
import { transactionTypeSchema } from "./transaction_type_schema.js";

export type CsvTransaction = z.infer<typeof csvTransactionSchema>;
export const csvTransactionSchema = z.object({
  date: dateSchema,
  total: numberSchema,
  total_stock: numberSchema,
  stock_price: numberSchema,
  company: z.string().min(1),
  transaction_type: transactionTypeSchema,
  email: z.string().min(1),
});
