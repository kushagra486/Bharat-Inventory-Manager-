"use client";

import Link from "next/link";
import { Mic, Search, Clock, MapPin, Store } from "lucide-react";
import type { ShopVM } from "@/app/shop/_components/types";

export function MarketplaceScreen({
  customerName,
  shops,
  onSearchFocus,
}: {
  customerName: string | null;
  shops: ShopVM[];
  onSearchFocus: () => void;
}) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingName = customerName ? customerName.split(" ")[0] : "there";

  return (
    <>
      <header className="relative overflow-hidden bg-[radial-gradient(circle_at_88%_12%,#91e5ff_0,transparent_26%),linear-gradient(134deg,#14399f,#3c4cdf_60%,#683fe7)] px-5 pt-6 pb-7 text-white">
        <div className="absolute -right-24 -bottom-24 size-[180px] rounded-full border-[28px] border-white/10" />
        <div className="relative text-[11px] opacity-80">BHARAT STORE MARKETPLACE</div>
        <div className="relative mt-2 mb-4 text-[21px] font-extrabold">
          {timeGreeting}, {greetingName} 👋
        </div>
        <button
          onClick={onSearchFocus}
          className="relative flex h-14 w-full items-center gap-2.5 rounded-[18px] bg-white/97 px-3.5 text-left text-muted-foreground shadow-[0_10px_24px_#0c236a30]"
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 text-sm">Search for an item across all shops…</span>
          <span className="grid size-[31px] shrink-0 place-items-center rounded-[10px] bg-accent text-primary">
            <Mic className="size-4" />
          </span>
        </button>
      </header>

      <main className="px-4 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-foreground">Shops near you</h2>
          <span className="text-[11px] font-extrabold text-muted-foreground">{shops.length} shops</span>
        </div>

        {shops.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No shops have joined the marketplace yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shop/${shop.id}`}
                className="flex items-center gap-3 rounded-[20px] border border-border bg-card p-3.5"
              >
                <div className="grid size-14 shrink-0 place-items-center rounded-[16px] bg-gradient-to-br from-[#edf3ff] to-[#dae6ff] text-2xl">
                  {shop.categoryIcons[0] ?? <Store className="size-6 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-foreground">{shop.name}</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {shop.productCount} item{shop.productCount === 1 ? "" : "s"} available
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {shop.deliveryEstimate && (
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <Clock className="size-3" />
                        {shop.deliveryEstimate}
                      </span>
                    )}
                    {shop.serviceArea && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {shop.serviceArea}
                      </span>
                    )}
                  </div>
                </div>
                {shop.categoryIcons.length > 1 && (
                  <div className="hidden shrink-0 gap-1 text-lg sm:flex">
                    {shop.categoryIcons.slice(1).map((icon, i) => (
                      <span key={i}>{icon}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
