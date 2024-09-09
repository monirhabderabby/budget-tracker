"use server";

import { getStatsBalanceKey, getTransactionskey } from "@/constants/cache";
import { updateBalanceCache } from "@/helper/cache/balance";
import prisma from "@/lib/db";
import { redis } from "@/lib/redis";
import { TransactionType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { Transaction } from "@prisma/client";
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
  // all transaction of user
  const cachedKey = getTransactionskey(user.id);
  const cachedData = await redis.get(cachedKey);
  const cachedTransactions = cachedData ? JSON.parse(cachedData) : null;

  if (cachedTransactions) {
    // Initialize an empty array to store the updated transactions
    const updatedTransactions = [];

    // Iterate over each transaction in the cachedTransactions array
    for (const data of cachedTransactions) {
      // Check if the current transaction matches the transaction that needs to be updated (based on ID)
      if (data.id === id) {
        // If the transaction type is "income", decrement the transaction amount from the income balance
        if (data.type === "income") {
          await updateBalanceCache({
            userId: user.id,
            amount: data.amount,
            type: "income",
            action: "decrement",
          });
        }
        // If the transaction type is "expense", decrement the transaction amount from the expense balance
        else if (data.type === "expense") {
          await updateBalanceCache({
            userId: user.id,
            type: "expense",
            amount: data.amount,
            action: "decrement",
          });
        }
      }
      // If the transaction does not match the ID that needs to be updated, add it to the updatedTransactions array
      else {
        updatedTransactions.push(data);
      }
    }

    // After processing all transactions, update the transactions cache in Redis
    // Store the updated transactions array as a JSON string
    await redis.set(cachedKey, JSON.stringify(updatedTransactions));
  }

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

  const statsBalanceKey = getStatsBalanceKey(user.id);
  await redis.del(statsBalanceKey);

  const cachedTransactionsKey = getTransactionskey(user.id);
  const cachedData = await redis.get(cachedTransactionsKey);
  const cachedTransactions = cachedData ? JSON.parse(cachedData) : null;

  // update cache
  if (cachedTransactions) {
    const updatedTransactions = cachedTransactions.filter(
      (item: Transaction) => !ids.includes(item.id)
    );
    await redis.set(cachedTransactionsKey, JSON.stringify(updatedTransactions));
  }

  return result;
}
