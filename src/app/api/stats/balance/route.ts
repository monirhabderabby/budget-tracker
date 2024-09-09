import { getStatsBalanceKey, getStatsRangeKey } from "@/constants/cache";
import prisma from "@/lib/db";
import { getVanilaDateFormat } from "@/lib/helpers";
import { redis } from "@/lib/redis";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(req: Request, res: Response) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Identify the date is found on the filtered table
  const dateTable = {
    from: getVanilaDateFormat(from),
    to: getVanilaDateFormat(to),
  };

  // stats key
  const statsRangeKey = getStatsRangeKey(user.id, from!, to!);
  const balanceKey = getStatsBalanceKey(user.id);

  const queryParams = overviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const dateCached = await redis.get(statsRangeKey);
  const cachedBalance = await redis.get(balanceKey);

  if (dateCached && cachedBalance) {
    return Response.json(JSON.parse(cachedBalance));
  }

  const stats = await getBalanceStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  // Cache the date range and transactions in Redis
  await redis.set(statsRangeKey, JSON.stringify(dateTable));
  await redis.set(balanceKey, JSON.stringify(stats));

  // Set expiration time for the cache keys (1 hour)
  await redis.expire(statsRangeKey, 60);
  await redis.expire(balanceKey, 60);

  return Response.json(stats);
}

export type GetBalanceStatsResponseType = Awaited<
  ReturnType<typeof getBalanceStats>
>;

async function getBalanceStats(userId: string, from: Date, to: Date) {
  const dateObj = new Date(from);
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const previousDay = new Date(dateObj.getTime() - oneDayInMilliseconds);
  const previousDayStr = previousDay.toISOString();
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
    where: {
      userId: userId,
      date: {
        gte: previousDayStr,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return {
    expense: totals.find((t) => t.type === "expense")?._sum.amount || 0,
    income: totals.find((t) => t.type === "income")?._sum.amount || 0,
  };
}
