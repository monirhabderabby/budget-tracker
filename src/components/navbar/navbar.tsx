"use client";

import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import Logo, { MobileLogo } from "../ui/logo";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { ThemeSwitcher } from "../ui/theme-switcher";

const items = [
  {
    label: "Dashboard",
    link: "/dashboard",
  },
  {
    label: "Transactions",
    link: "/transactions",
  },
  {
    label: "Manage",
    link: "/manage",
  },
  {
    label: "Bank",
    link: "/bank",
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const whiteList = ["/sign-in", "/sign-up", "/wizerd"];
  if (whiteList.includes(pathname)) {
    return null;
  }
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
    </>
  );
};

function DesktopNavbar() {
  return (
    <div className="hidden md:block border-separate border-b bg-background">
      <nav className="container flex items-center justify-between px-8">
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <Logo />
          <div className="flex w-full">
            {items.map((item) => (
              <NavbarItem
                key={item.label}
                label={item.label}
                link={item.link}
              />
            ))}
          </div>
        </div>
        <div className="space-x-4">
          <ThemeSwitcher />
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </nav>
    </div>
  );
}

function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <div className=" block md:hidden border-separate bg-foreground">
      <nav
        className={cn(
          "container flex items-center justify-between px-4",
          theme === "dark" ? "bg-black" : "bg-white"
        )}
      >
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]" side="left">
            <section className="flex flex-col justify-between h-full pb-[50px]">
              <div>
                <Logo />
                <div className="flex flex-col gap-1 pt-4">
                  {items.map((item) => (
                    <NavbarItem
                      key={item.label}
                      label={item.label}
                      link={item.link}
                      onCLickEvent={() => setIsOpen((prev) => !prev)}
                    />
                  ))}
                </div>
              </div>
            </section>
          </SheetContent>
        </Sheet>
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
          <MobileLogo />
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
    </div>
  );
}

function NavbarItem({
  label,
  link,
  onCLickEvent,
}: {
  label: string;
  link: string;
  onCLickEvent?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === link;
  return (
    <div className="relative flex items-center">
      <Link
        href={link}
        className={cn(
          buttonVariants({ variant: "lineAnim" }),
          "w-full  justify-start text-lg text-muted-foreground ",
          isActive && "text-foreground"
        )}
        onClick={() => {
          if (onCLickEvent) {
            onCLickEvent();
          }
        }}
      >
        {label}
      </Link>
      {isActive && (
        <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block" />
      )}
    </div>
  );
}

export default Navbar;
