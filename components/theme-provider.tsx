"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: "class" | "data-theme" | "data-mode";
  defaultTheme?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "dark",
  enableSystem = true,
  enableColorScheme = false,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      enableColorScheme={enableColorScheme}
      disableTransitionOnChange={disableTransitionOnChange}
      storageKey="aspch-theme"
      themes={["light", "dark"]}
      forcedTheme={undefined}
      enableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
