import { z } from "zod";

export const transactionTypeSchema = z.enum(["buy", "sell"]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;
