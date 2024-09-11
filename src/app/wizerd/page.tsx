// Packages
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Components
import Logo from "@/components/ui/logo";
import { Separator } from "@/components/ui/separator";
import { TextEffect } from "@/components/ui/text-effect";
import Wizerd from "@/components/ui/wizerd";
import prisma from "@/lib/db";

const page = async () => {
  // Get current user
  const user = await currentUser();

  // Redirect if not logged in
  if (!user) {
    return redirect("/sign-in");
  }

  // Check if user settings already exist
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  // Redirect to dashboard if settings exist
  if (userSettings) {
    return redirect("/dashboard");
  }

  // Main page rendering
  return (
    <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
      <div>
        <h1 className="text-center text-3xl">
          Welcome, <span className="ml-2 font-bold">{user.firstName} 🤚</span>
        </h1>
        <h2 className="mt-4 text-center text-base text-muted-foreground">
          <TextEffect per="char" preset="fade">
            Let's get started by setting up your currency
          </TextEffect>
        </h2>
        <h3 className="mt-2 text-center">
          <TextEffect per="char" preset="blur" delay={2}>
            You can change these settings at any time
          </TextEffect>
        </h3>
      </div>
      <Separator />
      <Wizerd />
      <div className="mt-8">
        <Logo />
      </div>
    </div>
  );
};

export default page;
