import { ReactNode } from "react";

export default function dashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen  w-full flex-col ">
      <div className="w-full">{children}</div>
    </div>
  );
}
