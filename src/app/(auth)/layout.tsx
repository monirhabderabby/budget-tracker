import Logo from "@/components/ui/logo";
import { ReactNode } from "react";

export default function authLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full">
      <Logo />
      <div className="mt-12">{children}</div>
    </div>
  );
}
