import { ReactNode } from "react";

export default function wizerdLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col items-center justify-center">
      {children}
    </div>
  );
}
