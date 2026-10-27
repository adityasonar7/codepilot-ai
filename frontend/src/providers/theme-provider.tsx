"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme provider wrapper using next-themes.
 * Defaults to dark mode with system detection.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
