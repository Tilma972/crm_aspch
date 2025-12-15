import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ASPCH CRM - Gestion des Qualifications",
  description:
    "Plateforme de gestion des qualifications pour l'Amicale des Sapeurs-Pompiers de Clermont-l'Hérault. Calendriers d'annonces, tarification automatique, facturation.",
  keywords: ["CRM", "ASPCH", "Qualifications", "Calendrier", "Sapeurs-Pompiers"],
  authors: [{ name: "ASPCH", url: "https://pompiers34800.com" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  openGraph: {
    title: "ASPCH CRM",
    description: "Gestion des qualifications ASPCH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200"
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            {children}
            <Toaster position="top-center" duration={3000} />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
