"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Settings,
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
    label: "Paramètres",
    icon: Settings,
    href: "/settings",
  },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-[#1A2530]/80 backdrop-blur-sm border-t border-white/10 flex justify-around items-start pt-2 px-2 md:hidden">
      {bottomNavRoutes.map((route) => (
        <Link
          href={route.href}
          key={route.href}
          className={cn(
            "flex flex-col items-center justify-center text-center w-24 text-xs font-medium transition-colors duration-200",
            pathname === route.href
              ? "text-[#0d7ff2]"
              : "text-[#90adcb] hover:text-white"
          )}
        >
          <route.icon
            className={cn(
              "h-8 w-8 mb-1",
              pathname === route.href
                ? "text-[#0d7ff2]"
                : "text-[#90adcb]"
            )}
          />
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
