"use server";

import prisma from "@/lib/db";
import {
  CreateCategorySchemaType,
  createCategorySchema,
} from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateCategory(form: CreateCategorySchemaType) {
  const parsedBody = createCategorySchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error("bad request!");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { name, icon, type } = parsedBody.data;

  return await prisma.category.create({
    data: {
      icon,
      name,
      type,
      userId: user.id,
    },
  });
}
