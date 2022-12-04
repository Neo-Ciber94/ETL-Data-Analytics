export const queueKeys = {
  routingKey: {
    error: "error",
    insight: "insight",
  },
  queue: {
    errors: "transactions.error",
    insights: "transactions.insight",
  },
  exchanges: {
    transactions: "transactions.direct",
  },
} as const;
