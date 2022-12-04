import { z } from "zod";
import { dateSchema } from "./date_schema.js";
import { numberSchema } from "./number_schema.js";
import { transactionTypeSchema } from "./transaction_type_schema.js";

export type XmlTransaction = z.infer<typeof xmlTransactionSchema>;
export const xmlTransactionSchema = z.object({
  date: z.string(),
  total: numberSchema,
  stock: numberSchema,
  stock_price: numberSchema,
  company: z.string().min(1),
  code: transactionTypeSchema,
  name: z.string().min(1),
  address: z.string().min(1),
  birthdate: dateSchema,
});
