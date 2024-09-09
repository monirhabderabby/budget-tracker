import { getStatsBalanceKey } from "@/constants/cache";
import { redis } from "@/lib/redis";

type balanceCacheParams = {
  userId: string;
  type: "income" | "expense";
  amount: number;
  action: "increment" | "decrement";
};
export const updateBalanceCache = async ({
  userId,
  action,
  type,
  amount,
}: balanceCacheParams) => {
  // Generate a Redis key based on the user's ID to retrieve their balance data
  const statsBalanceKey = getStatsBalanceKey(userId);

  // Fetch the current balance data from Redis, which is stored as a JSON string
  const data = await redis.get(statsBalanceKey);

  // Parse the retrieved balance data from JSON string to a JavaScript object
  let cachedData = JSON.parse(data!);

  switch (action) {
    case "increment":
      cachedData = {
        ...cachedData,
        [`${type}`]: cachedData[type] + amount,
      };
      break;

    case "decrement":
      cachedData = {
        ...cachedData,
        [`${type}`]: cachedData[type] - amount,
      };
    default:
      break;
  }

  // After updating the balance data, convert the updated JavaScript object back into a JSON string and store it in Redis.
  await redis.set(statsBalanceKey, JSON.stringify(cachedData));
};
