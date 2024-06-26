"use server";

import prisma from "@/lib/db";
import {
  CreateCategorySchemaType,
  DeleteCategorySchema,
  DeleteCategorySchemaType,
  UpdateCategorySchemaType,
  createCategorySchema,
  updateCategorySchema,
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

export async function DeleteCategory(form: DeleteCategorySchemaType) {
  const parsedBody = DeleteCategorySchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error("bad request!");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { name, type } = parsedBody.data;

  return await prisma.category.delete({
    where: {
      name_userId_type: {
        userId: user.id,
        name,
        type,
      },
    },
  });
}

export async function UpdateCategory(form: UpdateCategorySchemaType) {
  const parsedBody = updateCategorySchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error("bad request!");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { name, icon, type, categoryId } = parsedBody.data;

  return await prisma.category.update({
    where: {
      userId: user.id,
      id: categoryId,
    },
    data: {
      name,
      icon,
      type,
    },
  });
}
