"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";

export function Providers({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme?: string | null;
}) {
  return (
    <SessionProvider>
      <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
    </SessionProvider>
  );
}
