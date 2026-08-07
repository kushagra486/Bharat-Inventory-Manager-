"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, LayoutGrid, ListTree, ShoppingCart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid, match: (p: string) => p === "/dashboard" },
  {
    href: "/dashboard/products",
    label: "Inventory",
    icon: Boxes,
    match: (p: string) => p.startsWith("/dashboard/products"),
  },
  {
    href: "/dashboard/ai",
    label: "AI",
    icon: Sparkles,
    match: (p: string) => p.startsWith("/dashboard/ai"),
    isHero: true,
  },
  {
    href: "/dashboard/sales",
    label: "Sales",
    icon: ShoppingCart,
    match: (p: string) => p.startsWith("/dashboard/sales"),
  },
  {
    href: "/dashboard/more",
    label: "More",
    icon: ListTree,
    match: (p: string) =>
      p.startsWith("/dashboard/more") ||
      p.startsWith("/dashboard/orders") ||
      p.startsWith("/dashboard/customers") ||
      p.startsWith("/dashboard/reports") ||
      p.startsWith("/dashboard/settings") ||
      p.startsWith("/dashboard/categories") ||
      p.startsWith("/dashboard/suppliers"),
  },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 px-1.5 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+8px)] backdrop-blur md:hidden">
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        const color = active ? "text-primary" : "text-muted-foreground";
        if (tab.isHero) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn("flex flex-col items-center gap-0.5", color)}
            >
              <span
                className={cn(
                  "-mt-4 flex size-10 items-center justify-center rounded-full shadow-md",
                  active ? "bg-primary text-primary-foreground" : "bg-card text-primary",
                )}
              >
                <tab.icon className="size-5" />
              </span>
              <span className="text-[10px] leading-none">{tab.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn("flex flex-col items-center gap-1 px-3 py-1", color)}
          >
            <tab.icon className="size-5" strokeWidth={1.8} />
            <span className="text-[10px] leading-none">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
