"use server";

import prisma from "@/lib/db";
import { CreateBankSchema, CreateBankSchemaType } from "@/schema/bank";
import { BankAccountInputType } from "@/types";
import { currentUser } from "@clerk/nextjs/server";
import { Account } from "@prisma/client";
import { redirect } from "next/navigation";

export const addBankAccount = async (data: CreateBankSchemaType) => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const parsedBody = CreateBankSchema.safeParse(data);

  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  return await prisma.account.create({
    data: {
      userId: user.id,
      accountName: parsedBody.data?.accountName,
      accountLogo: parsedBody.data.accountLogo,
      amount: 0,
    },
  });
};

export const addBulkBankAccount = async (
  banks: BankAccountInputType[]
): Promise<Account[]> => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Insert multiple bank accounts
    await prisma.account.createMany({
      data: banks,
    });

    // Fetch and return the newly created accounts
    const createdAccounts = await prisma.account.findMany({
      where: {
        userId: user.id,
        accountName: {
          in: banks.map((bank) => bank.accountName),
        },
      },
    });

    return createdAccounts;
  } catch (error) {
    console.error("Error adding bank accounts:", error);
    throw new Error("Failed to add bank accounts");
  }
};
