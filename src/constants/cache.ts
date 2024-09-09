import { getVanilaDateFormat } from "@/lib/helpers";

// transactions history
export const getDateRangekeyForTransactions = (
  userId: string,
  from: string,
  to: string
) => {
  return `date:userId=${userId}&from=${getVanilaDateFormat(
    from
  )}&to=${getVanilaDateFormat(to)}`;
};

export const getTransactionskey = (userId: string) => {
  return `transactions:userId=${userId}`;
};

// stats
export const getStatsRangeKey = (userId: string, from: string, to: string) => {
  return `statsDate:userId=${userId}&from=${getVanilaDateFormat(
    from
  )}&to=${getVanilaDateFormat(to)}`;
};

export const getStatsBalanceKey = (userId: string) => {
  return `stats_balance:userId=${userId}`;
};
