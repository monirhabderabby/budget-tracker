import prisma from "@/lib/db";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }
  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = overviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const transactions = await getTransactionsHistory(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(transactions);
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

  const formatter = GetFormatterForCurrency(userSettings.currency);

  const dateObj = new Date(from);
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
  const previousDay = new Date(dateObj.getTime() - oneDayInMilliseconds);
  const previousDayStr = previousDay.toISOString();

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
  });

  return transactions.map((transaction) => ({
    ...transaction,
    // let's format the amount with the user currency
    formattedAmount: formatter.format(transaction.amount),
  }));
}
