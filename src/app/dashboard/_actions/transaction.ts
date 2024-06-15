"use server";

import prisma from "@/lib/db";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
  UpdateTransactionSchema,
  UpdateTransactionSchemaType,
} from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { amount, category, date, type, description, accountId } =
    parsedBody.data;

  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error("category not found!");
  }

  // NOTE: don't make confucion between $transaction ( prisma ) and prisma.transaction (table)

  try {
    const result = await prisma.$transaction([
      // create user transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          amount,
          date,
          description: description || "",
          type,
          category: categoryRow.name,
          categoryIcon: categoryRow.icon,
          accountId,
        },
      }),

      // update aggregate table
      prisma.monthHistory.upsert({
        where: {
          day_month_year_userId: {
            userId: user.id,
            day: date.getUTCDate(),
            month: date.getUTCMonth(),
            year: date.getUTCFullYear(),
          },
        },
        create: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
          expense: type === "expense" ? amount : 0,
          income: type === "income" ? amount : 0,
        },
        update: {
          expense: {
            increment: type === "expense" ? amount : 0,
          },
          income: {
            increment: type === "income" ? amount : 0,
          },
        },
      }),

      // update year aggrigate
      prisma.yearHistory.upsert({
        where: {
          month_year_userId: {
            userId: user.id,
            month: date.getUTCMonth(),
            year: date.getUTCFullYear(),
          },
        },
        create: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
          expense: type === "expense" ? amount : 0,
          income: type === "income" ? amount : 0,
        },
        update: {
          expense: {
            increment: type === "expense" ? amount : 0,
          },
          income: {
            increment: type === "income" ? amount : 0,
          },
        },
      }),
    ]);

    // Conditionally update the account balance
    if (type === "income") {
      await prisma.account.update({
        where: {
          id: accountId,
        },
        data: {
          amount: {
            increment: amount,
          },
        },
      });
    } else if (type === "expense") {
      await prisma.account.update({
        where: {
          id: accountId,
        },
        data: {
          amount: {
            decrement: amount,
          },
        },
      });
    }

    return result;
  } catch (error) {
    console.log(error);
  }
}

export async function updateTransaction(form: UpdateTransactionSchemaType) {
  const parsedBody = UpdateTransactionSchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const {
    amount,
    category,
    date,
    type,
    description,
    accountId,
    transactionId,
    previousAmount,
    previousAccountId,
    previousDate,
  } = parsedBody.data;

  // Instance
  const isDateChanged =
    previousDate.getDay() !== date.getDay() ||
    previousDate.getMonth() !== date.getMonth() ||
    previousDate.getFullYear() !== date.getFullYear();
  const isTransactedWithSameAccount = accountId === previousAccountId;

  // LOGIC #1: Update the transaction.
  // Action 1: {GET CATEGORY}
  const categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  if (!categoryRow) {
    throw new Error("category not found!");
  }

  // LOGIC #1:
  // Action 2: update the trancsaction
  const transactionUpdateResult = await prisma.transaction.update({
    where: {
      userId: user.id,
      id: transactionId,
    },
    data: {
      userId: user.id,
      amount,
      date,
      description: description || "",
      type,
      category: categoryRow.name,
      categoryIcon: categoryRow.icon,
      accountId,
    },
  });

  console.log("@@transactionUpdateResult", transactionUpdateResult);

  // Calculate the difference between the previous amount and the new amount
  const differAmount = Math.abs(previousAmount - amount);
  const isWillbeIncrease = amount >= previousAmount;

  // LOGIC #2: Checking current date and previus date. If found diffenece betweet date and previous date then there are two sub  logic will be work on the conditional scope

  if (isDateChanged) {
    // SUBLOGIC #1: Decrease previous amount from previous date [monthHistory, yearHistory]
    const decreasePreviousMonthAmount = prisma.monthHistory.update({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: previousDate.getUTCDate(),
          month: previousDate.getUTCMonth(),
          year: previousDate.getUTCFullYear(),
        },
      },
      data: {
        income: {
          decrement: type === "income" ? previousAmount : 0,
        },
        expense: {
          decrement: type === "expense" ? previousAmount : 0,
        },
      },
    });

    const decreasePreviousYearAmount = prisma.yearHistory.update({
      where: {
        month_year_userId: {
          userId: user.id,
          month: previousDate.getUTCMonth(),
          year: previousDate.getUTCFullYear(),
        },
      },
      data: {
        income: {
          decrement: type === "income" ? previousAmount : 0,
        },
        expense: {
          decrement: type === "expense" ? previousAmount : 0,
        },
      },
    });

    const [
      decreasePreviousAMountFromMonthResult,
      decreasePreviousAMountFromYearResult,
    ] = await prisma.$transaction([
      decreasePreviousMonthAmount,
      decreasePreviousYearAmount,
    ]);

    console.log(
      "@@decreasePreviousAMountFromMonthResult",
      decreasePreviousAMountFromMonthResult
    );
    console.log(
      "@@decreasePreviousAMountFromYearResult",
      decreasePreviousAMountFromYearResult
    );
  }

  // LOGIC #2 >> SUBLOGIC #2: Increment of Decreament data on the monthsihtory and yearHistory based on the condition

  // Prepare data for updating month history
  const updateMonthData: any = {};

  // Prepare data for updating year history
  const updateYearData: any = {};

  // Determine the increment and decrement values for expense and income
  if (type === "expense") {
    if (isWillbeIncrease) {
      updateMonthData.expense = {
        increment: isDateChanged ? amount : differAmount,
      };
      updateYearData.expense = {
        increment: isDateChanged ? amount : differAmount,
      };
    } else {
      updateMonthData.expense = {
        decrement: isDateChanged ? amount : differAmount,
      };
      updateYearData.expense = {
        decrement: isDateChanged ? amount : differAmount,
      };
    }
  } else if (type === "income") {
    if (isWillbeIncrease) {
      updateMonthData.income = {
        increment: isDateChanged ? amount : differAmount,
      };
      updateYearData.income = {
        increment: isDateChanged ? amount : differAmount,
      };
    } else {
      updateMonthData.income = {
        decrement: isDateChanged ? amount : differAmount,
      };
      updateYearData.income = {
        decrement: isDateChanged ? amount : differAmount,
      };
    }
  }

  const monthHistoryUpdate = prisma.monthHistory.upsert({
    where: {
      day_month_year_userId: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
      },
    },
    create: {
      userId: user.id,
      day: date.getUTCDate(),
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      expense: type === "expense" ? amount : 0,
      income: type === "income" ? amount : 0,
    },
    update: updateMonthData,
  });

  const yearHistoryUpdate = prisma.yearHistory.upsert({
    where: {
      month_year_userId: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
      },
    },
    create: {
      userId: user.id,
      month: date.getUTCMonth(),
      year: date.getUTCFullYear(),
      expense: type === "expense" ? amount : 0,
      income: type === "income" ? amount : 0,
    },
    update: updateYearData,
  });

  const [monthHistoryResult, yearHistoryResult] = await prisma.$transaction([
    monthHistoryUpdate,
    yearHistoryUpdate,
  ]);

  // Update Bank Balance
  // If the transaction happen on the same account
  if (isTransactedWithSameAccount) {
    // If the same account it transacted then database actions
    if (type === "income") {
      if (isWillbeIncrease) {
        // Increment amount for the account
        await prisma.account.update({
          where: {
            userId: user.id,
            id: accountId,
          },
          data: {
            amount: {
              increment: differAmount,
            },
          },
        });
        return;
      } else {
        // Decrement amount for the account
        await prisma.account.update({
          where: {
            userId: user.id,
            id: accountId,
          },
          data: {
            amount: {
              decrement: differAmount,
            },
          },
        });
        return;
      }
    } else if (type === "expense") {
      if (isWillbeIncrease) {
        // as it is expense so increment means it will be cut from account
        await prisma.account.update({
          where: {
            userId: user.id,
            id: accountId,
          },
          data: {
            amount: {
              decrement: differAmount,
            },
          },
        });
        return;
      } else {
        // as it is expense so decrement means it will be cut from account

        await prisma.account.update({
          where: {
            userId: user.id,
            id: accountId,
          },
          data: {
            amount: {
              increment: differAmount,
            },
          },
        });
        return;
      }
    }
  }

  // if the transaction not happen on the same account
  if (!isTransactedWithSameAccount) {
    // If type income
    if (type === "income") {
      // remove amount from previous account
      await prisma.account.update({
        where: {
          userId: user.id,
          id: previousAccountId,
        },
        data: {
          amount: {
            decrement: previousAmount,
          },
        },
      });
      // add new amount on the changed account
      await prisma.account.update({
        where: {
          userId: user.id,
          id: accountId,
        },
        data: {
          amount: {
            increment: amount,
          },
        },
      });
      return;
    }

    // If type expense
    if (type === "expense") {
      // restore amount on the previous account
      await prisma.account.update({
        where: {
          userId: user.id,
          id: previousAccountId,
        },
        data: {
          amount: {
            increment: previousAmount,
          },
        },
      });

      // remove amount on the current account
      await prisma.account.update({
        where: {
          userId: user.id,
          id: accountId,
        },
        data: {
          amount: {
            decrement: amount,
          },
        },
      });
      return;
    }
  }

  return monthHistoryResult;
}

// Conditionally update the account balance
