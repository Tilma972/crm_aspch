import React from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-lg font-semibold">
                CRM
              </Link>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/companies"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Entreprises
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div>{children}</div>
    </div>
  );
}
