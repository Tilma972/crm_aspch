"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Settings,
} from "lucide-react";

const routes = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Entreprises",
    icon: Building2,
    href: "/entreprises",
    color: "text-violet-500",
  },
  {
    label: "Qualifications",
    icon: FileText,
    href: "/qualifications",
    color: "text-pink-700",
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/settings",
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          title="Menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
        <div className="space-y-4 py-4 flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 text-white">
          {/* Header */}
          <div className="px-6 py-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold">CRM</h1>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer le menu</span>
              </Button>
            </SheetClose>
          </div>

          {/* Navigation */}
          <div className="px-3 py-2 flex-1">
            <div className="space-y-1">
              {routes.map((route) => (
                <SheetClose asChild key={route.href}>
                  <Link
                    href={route.href}
                    className={cn(
                      "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                      pathname === route.href
                        ? "text-white bg-white/10"
                        : "text-zinc-400"
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                      {route.label}
                    </div>
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-xs text-zinc-400">
              ASPCH CRM v1.0
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
