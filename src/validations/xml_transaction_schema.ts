import { z } from "zod";
import { numberSchema } from "./number_schema";
import { transactionTypeSchema } from "./transaction_type_schema";

export type XmlTransaction = z.infer<typeof xmlTransactionSchema>;
export const xmlTransactionSchema = z.object({
  date: z.string(),
  total: numberSchema,
  stock: numberSchema,
  stock_price: numberSchema,
  company: z.string(),
  code: transactionTypeSchema,
  name: z.string(),
  address: z.string(),
  birthdate: z.string(),
});
