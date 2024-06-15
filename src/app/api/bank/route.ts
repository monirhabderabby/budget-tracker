import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Export the runtime config to specify that this route should be handled by the edge
export const runtime = "edge";

export async function GET(req: Request, res: Response) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await prisma.account.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(result);
}
