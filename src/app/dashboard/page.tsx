import { Button } from "@/components/ui/button";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings) redirect("/wizerd");
  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <p className="text-3xl font-bold">Hello, {user.firstName}! 🤚</p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
            >
              New income 🤑
            </Button>
            <Button
              variant="outline"
              className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white"
            >
              New expense 😤
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
