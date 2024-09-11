"use server";

import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function UpdateUserCurrency(currency: string) {
  if (!currency) throw new Error("Currency is required");

  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const userSettings = await prisma.userSettings.update({
    where: {
      userId: user.id,
    },
    data: {
      currency,
    },
  });

  return userSettings;
}
