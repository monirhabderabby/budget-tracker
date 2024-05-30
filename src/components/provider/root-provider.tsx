"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { ReactNode } from "react";

const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
};

export default RootProvider;
