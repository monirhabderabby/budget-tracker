import prisma from "@/lib/db";
import { overviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(req: Request, res: Response) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(req.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = overviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, {
      status: 400,
    });
  }

  const stats = await getBankStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(stats);
}

export type GetBankStatsResponseType = Awaited<ReturnType<typeof getBankStats>>;

async function getBankStats(userId: string, from: Date, to: Date) {
  const result = await prisma.account.findMany({});

  return {
    result,
  };
}
