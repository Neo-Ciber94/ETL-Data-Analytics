import { z } from "zod";

export const TransactionTypeSchema = z.enum(["buy", "sell"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const JsonTransactionSchema = z.object({
  amount: z.number(),
  price: z.number(),
  total: z.number(),
  account_id: z.number(),
  transaction_code: TransactionTypeSchema,
  symbol: z.string(),
});

export type JsonTransaction = z.infer<typeof JsonTransactionSchema>;

export const CsvTransactionSchema = z.object({
  date: z.string(), // TODO: string or date
  total: z.number(),
  total_stock: z.number(),
  stock_price: z.number(),
  company: z.string(),
  transaction_type: TransactionTypeSchema,
  email: z.string(),
});

export type CsvTransaction = z.infer<typeof CsvTransactionSchema>;

export const XmlTransactionSchema = z.object({
  date: z.string(), // TODO: string or date
  total: z.number(),
  stock: z.number(),
  stock_price: z.number(),
  company: z.string(),
  code: TransactionTypeSchema,
  name: z.string(),
  address: z.string(),
  birthdate: z.string(),
});

export type XmlTransaction = z.infer<typeof XmlTransactionSchema>;
