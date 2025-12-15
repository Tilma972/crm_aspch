"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Settings,
  FileText,
} from "lucide-react";

const bottomNavRoutes = [
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
  {
    label: "Paramètres",
    icon: Settings,
    href: "/settings",
  },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface-card/90 backdrop-blur-sm border-t border-border-subtle flex justify-around items-center px-1 md:hidden">
      {bottomNavRoutes.map((route) => (
        <Link
          href={route.href}
          key={route.href}
          className={cn(
            "flex flex-col items-center justify-center text-center flex-1 text-xs font-medium transition-colors duration-200 py-2",
            pathname === route.href
              ? "text-accent-blue"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          <route.icon
            className={cn(
              "h-6 w-6 mb-0.5",
              pathname === route.href
                ? "text-accent-blue"
                : "text-icon-neutral"
            )}
          />
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
