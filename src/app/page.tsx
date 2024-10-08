// Packages
import TextSwipe from "@/components/animation/text-swipe";
import { currentUser } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
import Link from "next/link";

// Components
const BannerImage = dynamic(() => import("@/components/hero/banner-image"));

export default async function Home() {
  const user = await currentUser();

  return (
    <div>
      <section className=" pb-10 flex flex-col items-center ">
        <div className="mx-auto max-w-7xl px-4 py-32">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-3xl font-extrabold sm:text-5xl ">
              <div className="flex items-center gap-x-4">
                Manage Your <TextSwipe />
              </div>
              <strong className="font-extrabold text-primary sm:block">
                {" "}
                Control your Money.{" "}
              </strong>
            </h1>

            <p className="mt-4 sm:text-xl/relaxed">
              start creating your budget and save ton of money
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                className="block w-full rounded bg-primary px-12 py-3 text-sm font-medium text-white shadow hover:shadow-2xl z-50 focus:outline-none focus:ring active:bg-amber-600 bg-gradient-to-r from-amber-400 to-orange-500 sm:w-auto"
                href={user ? "/dashboard" : "/sign-in"}
              >
                {user ? "Take me to the Dashboard" : "Get Started Now"}
              </Link>
            </div>
          </div>
        </div>
        <BannerImage />
      </section>
    </div>
  );
}
