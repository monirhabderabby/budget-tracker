import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BankStats from "./_components/bank-stats";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });
  return (
    <div className="container  py-6">
      <h2 className="text-3xl font-bold">Bank Balance</h2>
      <div>
        <BankStats userSettings={userSettings!} />
      </div>
    </div>
  );
};

export default Page;
