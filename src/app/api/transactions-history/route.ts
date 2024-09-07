import prisma from "@/lib/db"; // Import the Prisma instance to interact with the database
import { GetFormatterForCurrency, getVanilaDateFormat } from "@/lib/helpers";
import { redis } from "@/lib/redis"; // Import the Redis instance for caching
import { overviewQuerySchema } from "@/schema/overview"; // Import the schema for validating query parameters
import { currentUser } from "@clerk/nextjs/server"; // Import function to get the current user from Clerk
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }
  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Import function to get the current user from Clerk
  const queryParams = overviewQuerySchema.safeParse({ from, to });

  // If validation fails, return a 400 error with the error message
  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  // Identify the date is found on the filtered table
  const dateTable = {
    from: getVanilaDateFormat(from),
    to: getVanilaDateFormat(to),
  };

  // Generate cache keys based on user ID and date range
  const cachedDateKey = `date:userId=${user.id}&from=${getVanilaDateFormat(
    from
  )}&to=${getVanilaDateFormat(to)}`;
  const key = `transactions:userId=${user.id}`;

  const dateCached = await redis.get(cachedDateKey); // Check if the date range is cached
  const cache = await redis.get(key); // Check if the transactions are cached

  // If both the date range and transactions are cached, return the cached transactions data
  if (dateCached && cache) {
    return Response.json(JSON.parse(cache));
  }

  // Fetch the transaction history from the database
  const transactions = await getTransactionsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  // Cache the date range and transactions in Redis
  await redis.set(cachedDateKey, JSON.stringify(dateTable));
  await redis.set(key, JSON.stringify(transactions));

  // Set expiration time for the cache keys (1 hour)
  await redis.expire(cachedDateKey, 60);
  await redis.expire(key, 60);

  // Return the transactions as the response
  return NextResponse.json(transactions);
}

export type GetTransactionsHistoryType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!userSettings) {
    throw new Error("user settings not found!");
  }

  // Get the currency formatter based on user settings
  const formatter = GetFormatterForCurrency(userSettings.currency);

  // Calculate the previous day for the query range
  const dateObj = new Date(from);
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const previousDay = new Date(dateObj.getTime() - oneDayInMilliseconds);
  const previousDayStr = previousDay.toISOString();

  // Fetch the transactions from the database
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: previousDayStr,
        lte: to,
      },
    },
    orderBy: {
      date: "desc",
    },
    include: {
      account: true,
    },
  });

  // Return the transactions with formatted amounts
  return transactions.map((transaction) => ({
    ...transaction,
    // let's format the amount with the user currency
    formattedAmount: formatter.format(transaction.amount),
  }));
}
