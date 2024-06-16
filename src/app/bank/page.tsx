import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
const BankStats = dynamic(() => import("./_components/bank-stats"), {
  ssr: false,
});

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
