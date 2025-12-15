"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { UserNav } from "@/components/layout/user-nav";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    LayoutDashboard,
    Building2,
    FileText,
} from "lucide-react";

const routes = [
    {
        label: "Tableau de bord",
        icon: LayoutDashboard,
        href: "/",
    },
    {
        label: "Entreprises",
        icon: Building2,
        href: "/entreprises",
    },
    {
        label: "Qualifications",
        icon: FileText,
        href: "/qualifications",
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background">
            {/* NAVBAR DESKTOP & MOBILE */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center px-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 mr-6 group">
                        <div className="h-8 w-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-700 transition-colors">
                            A
                        </div>
                        <span className="font-bold text-lg hidden sm:inline">CRM ASPCH</span>
                    </Link>

                    {/* Separator */}
                    <Separator orientation="vertical" className="h-6 mx-2 hidden sm:flex" />

                    {/* Navigation Desktop */}
                    <nav className="hidden md:flex items-center space-x-1 flex-1">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                                    pathname === route.href
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                        <ThemeToggle />
                        <Separator orientation="vertical" className="h-6" />
                        <UserNav />
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="container px-4 py-6 md:py-8 pb-28 md:pb-8">
                {children}
            </main>

            {/* BOTTOM NAVIGATION - Mobile Only */}
            <BottomNavBar />
        </div>
    );
}