"use server";

import prisma from "@/lib/db";
import { WizerdSchema, WizerdSchemaType } from "@/schema/wizerd.schema";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function UpdateWizerdSettings(data: WizerdSchemaType) {
  const user = await currentUser();

  // Redirect if the user is not logged in
  if (!user) {
    return redirect("/sign-in");
  }

  // Validate the input data
  const {
    success,
    data: parsedData,
    error: validationError,
  } = WizerdSchema.safeParse(data);
  if (!success) {
    return { success: false, error: validationError.message };
  }

  const { banks, currency } = parsedData;

  // Using upsert here to avoid creating duplicate settings for the same user
  const updateCurrency = prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { currency },
    create: { userId: user.id, currency },
  });

  const updateBanks = prisma.account.createMany({
    data: banks,
  });

  try {
    await prisma.$transaction([updateCurrency, updateBanks]);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
