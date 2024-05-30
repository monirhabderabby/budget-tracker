import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  try {
    let userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          currency: "USD",
          userId: user.id,
        },
      });
    }
    revalidatePath("/");
    return NextResponse.json(userSettings);
  } catch (error) {
    console.log("SERVER_ERROR_ON_USER-SETTINGS", error);
  }
}
