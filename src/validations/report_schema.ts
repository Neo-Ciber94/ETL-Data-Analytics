import { z } from "zod";

export type Report = z.infer<typeof reportSchema>;

export const reportSchema = z.object({
  name: z.string(),
  username: z.string(),
  sell_count: z.number(),
  buy_count: z.number(),
  min_investment: z.number(),
  max_investment: z.number(),
  total_stock: z.number(),
});
