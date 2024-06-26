"use server";

import prisma from "@/lib/db";
import { MoneyTransferSchema, MoneyTransferSchemaType } from "@/schema/bank";
import { currentUser } from "@clerk/nextjs/server";

export const moneyTransfer = async (data: MoneyTransferSchemaType) => {
  const user = await currentUser();

  if (!user) {
    return {
      error: "UnAuthenticated request",
    };
  }

  const parsedBody = MoneyTransferSchema.safeParse(data);

  if (parsedBody.error) {
    return {
      error: parsedBody.error,
    };
  }

  const { from, to, amount } = parsedBody.data;

  const fromAccount = await prisma.account.findUnique({
    where: {
      id: from,
    },
  });

  if (!fromAccount) {
    return { error: "From Account Not Found 🔴" };
  }

  if (fromAccount.amount < amount) {
    return { error: "Insufficient funds in the source account 😭" };
  }

  try {
    await prisma.$transaction([
      prisma.account.update({
        where: {
          id: from,
        },
        data: {
          amount: {
            decrement: amount,
          },
        },
      }),
      prisma.account.update({
        where: {
          id: to,
        },
        data: {
          amount: {
            increment: amount,
          },
        },
      }),
    ]);

    console.log("Money Transfer Successful 🎉");

    return {
      success: "Money Transfer Successful 🎉",
    };
  } catch (error) {
    return {
      error: "Money transfer failed due to an unexpected error 😔",
    };
  }
};
