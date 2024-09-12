"use server";

import prisma from "@/lib/db";
import {
  BankSelectionFormSchema,
  BankSelectionFormSchemaType,
} from "@/schema/bank";
import { BankAccountInputType } from "@/types";
import { currentUser } from "@clerk/nextjs/server";
import { Account } from "@prisma/client";
import { redirect } from "next/navigation";

export const addBankAccount = async (data: BankSelectionFormSchemaType) => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const parsedBody = BankSelectionFormSchema.safeParse(data);

  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  // do some stuff here
};

export const updateBankAccount = async (data: BankSelectionFormSchemaType) => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const parsedBody = BankSelectionFormSchema.safeParse(data);

  if (!parsedBody.success) throw new Error(parsedBody.error.message);

  // in my database already have bkash account I want to update all the bank exist in the db. but must think in the production I dont know bkash account exist or not. so I will check it first and then update it. if not exist then I will create it.

  try {
    const existingBanks = await prisma.account.findMany({
      where: {
        userId: user.id,
      },
    });

    // Filter out the banks that already exist in the database and currently not exist in the parsedBody.data.banks array.

    // Delete the banks that are not present in the parsedBody.data.banks array.
    // Delete banks that are not present in the new data
    const willBeDeleted = existingBanks.filter(
      (bank) =>
        !parsedBody.data.banks.some(
          (newBank) =>
            newBank.accountName === bank.accountName &&
            newBank.accountLogo === bank.accountLogo
        )
    );
    const deleteIds = willBeDeleted.map((bank) => bank.id);

    if (deleteIds.length > 0) {
      await prisma.account.deleteMany({
        where: {
          id: {
            in: deleteIds,
          },
        },
      });
    }

    for (const bank of parsedBody.data.banks) {
      await prisma.account.upsert({
        where: {
          userId_accountName: {
            userId: user.id,
            accountName: bank.accountName,
          },
        },
        update: {
          accountLogo: bank.accountLogo,
          amount: bank.amount,
        },
        create: {
          accountName: bank.accountName,
          accountLogo: bank.accountLogo,
          amount: bank.amount,
          userId: user.id,
        },
      });
    }

    return { message: "Bank accounts updated successfully" };
  } catch (error: Error | any) {
    console.log(error.message);
  }
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
