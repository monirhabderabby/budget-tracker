"use server";

import prisma from "@/lib/db";
import { redis } from "@/lib/redis";
import { TransactionType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function DeleteTransaction(id: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });

  if (!transaction) {
    throw new Error("bad request");
  }

  // update account
  await prisma.$transaction([
    // Delete transaction from db
    prisma.transaction.delete({
      where: {
        id,
        userId: user.id,
      },
    }),
    // Update month history
    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
    // Update year history
    prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    }),
  ]);

  // update cache
  await redis.del(`id_${user.id}_transactions`);

  switch (transaction.type as TransactionType) {
    case "income":
      await prisma.account.update({
        where: {
          userId: user.id,
          id: transaction.accountId,
        },
        data: {
          amount: {
            decrement: transaction.amount || 0,
          },
        },
      });
      return;

    case "expense":
      await prisma.account.update({
        where: {
          userId: user.id,
          id: transaction.accountId,
        },
        data: {
          amount: {
            increment: transaction.amount || 0,
          },
        },
      });
      return;

    default:
      break;
  }
}

export async function bulkDelete(ids: string[]) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const allTransactions = await prisma.transaction.findMany({
    where: {
      id: {
        in: ids,
      },
      userId: user.id,
    },
  });

  const deleteTransactionOperation = prisma.transaction.deleteMany({
    where: {
      id: {
        in: ids,
      },
      userId: user.id,
    },
  });

  // Create monthHistory update operations
  const monthHistoryOperations = allTransactions.map((transaction) =>
    prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: transaction.date.getUTCDate(),
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    })
  );

  // Create yearHistory update operations
  const yearHistoryOperations = allTransactions.map((transaction) =>
    prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: transaction.date.getUTCMonth(),
          year: transaction.date.getUTCFullYear(),
        },
      },
      data: {
        ...(transaction.type === "expense" && {
          expense: {
            decrement: transaction.amount,
          },
        }),
        ...(transaction.type === "income" && {
          income: {
            decrement: transaction.amount,
          },
        }),
      },
    })
  );

  // Group transactions by accountId and type to create account update operations

  interface AccountUpdate {
    accountId: string;
    type: "income" | "expense";
    amount: number;
  }
  const accountUpdates = allTransactions.reduce<Record<string, AccountUpdate>>(
    (acc, transaction) => {
      const key = `${transaction.accountId}-${transaction.type}`;
      if (!acc[key]) {
        acc[key] = {
          accountId: transaction.accountId,
          type: transaction.type as TransactionType,
          amount: 0,
        };
      }
      acc[key].amount += transaction.amount;
      return acc;
    },
    {}
  );

  const accountOperations = Object.values(accountUpdates).map(
    ({ accountId, type, amount }) =>
      prisma.account.update({
        where: {
          userId: user.id,
          id: accountId,
        },
        data: {
          amount:
            type === "income" ? { decrement: amount } : { increment: amount },
        },
      })
  );

  // Combine all operations into a single transaction
  const result = await prisma.$transaction([
    deleteTransactionOperation,
    ...monthHistoryOperations,
    ...yearHistoryOperations,
    ...accountOperations,
  ]);

  return result;
}
