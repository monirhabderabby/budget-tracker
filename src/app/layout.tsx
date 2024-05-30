import Navbar from "@/components/navbar/navbar";
import RootProvider from "@/components/provider/root-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Budget Tracker",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className="dark:"
        style={{
          colorScheme: "dark",
        }}
      >
        <body className={inter.className}>
          <Toaster richColors position="bottom-right" />
          <RootProvider>
            <Navbar />
            {children}
          </RootProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
