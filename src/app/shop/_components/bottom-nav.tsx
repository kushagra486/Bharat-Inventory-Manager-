"use client";

import { Home, Search, ShoppingCart, Package, CircleUserRound } from "lucide-react";
import type { Screen } from "@/app/shop/[ownerId]/_components/types";

const NAV_ITEMS: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "cart", label: "Cart", icon: ShoppingCart },
  { id: "orders", label: "Orders", icon: Package },
  { id: "profile", label: "Profile", icon: CircleUserRound },
];

export function BottomNav({
  screen,
  onNavigate,
  cartCount,
}: {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  cartCount: number;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex h-[77px] w-full max-w-[430px] items-center justify-around border-t border-border bg-card/96 backdrop-blur-lg">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`relative flex min-w-12 flex-col items-center gap-1 text-[10px] font-bold ${
            screen === id ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <span className="relative">
            <Icon className="size-5" />
            {id === "cart" && cartCount > 0 && (
              <span className="absolute -top-2 -right-1.5 rounded-full bg-[#ff7a25] px-1.5 py-0.5 text-[9px] leading-none font-bold text-white">
                {cartCount}
              </span>
            )}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
