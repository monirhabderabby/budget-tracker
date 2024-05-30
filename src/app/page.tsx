import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <section className=" pb-10 flex flex-col items-center ">
        <div className="mx-auto max-w-7xl px-4 py-32">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-3xl font-extrabold sm:text-5xl">
              Manage Your Expense.
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
                href="/sign-in"
              >
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
        <Image
          src="/dashboard.webp"
          alt="dashboard"
          width={1000}
          height={700}
          className="mt-5 rounded-xl border-2"
          priority
        />
      </section>
    </div>
  );
}
