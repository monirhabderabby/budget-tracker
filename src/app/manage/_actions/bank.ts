"use server";

import prisma from "@/lib/db";
import { CreateBankSchema, CreateBankSchemaType } from "@/schema/bank";
import { currentUser } from "@clerk/nextjs/server";
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
      amount: parsedBody.data.amount,
    },
  });
};
