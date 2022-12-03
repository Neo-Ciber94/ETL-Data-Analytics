import { z } from "zod";
import { numberSchema } from "./number_schema";

export const transactionTypeSchema = z.enum(["buy", "sell"]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export type JsonTransaction = z.infer<typeof jsonTransactionSchema>;
export const jsonTransactionSchema = z.object({
  amount: numberSchema,
  price: numberSchema,
  total: numberSchema,
  account_id: z.number(),
  transaction_code: transactionTypeSchema,
  symbol: z.string(),
});

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
