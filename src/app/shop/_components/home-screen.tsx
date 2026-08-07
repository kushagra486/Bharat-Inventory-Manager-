"use client";

import Link from "next/link";
import { Mic, Search, ScanLine, Heart, ArrowLeft, Clock } from "lucide-react";
import type { CategoryVM, ProductVM, ShopVM } from "@/app/shop/_components/types";

export function HomeScreen({
  shop,
  customerName,
  products,
  categories,
  activeCategoryId,
  onCategorySelect,
  onSearchFocus,
  onAddToCart,
  onOpenSearch,
}: {
  shop: ShopVM;
  customerName: string | null;
  products: ProductVM[];
  categories: CategoryVM[];
  activeCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
  onSearchFocus: () => void;
  onAddToCart: (product: ProductVM) => void;
  onOpenSearch: () => void;
}) {
  const shopName = shop.name;
  const visibleProducts = activeCategoryId
    ? products.filter((p) => p.categoryId === activeCategoryId)
    : products;
  const featured = products[0];
  const greetingName = customerName ? customerName.split(" ")[0] : "there";
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <header className="relative overflow-hidden bg-[radial-gradient(circle_at_88%_12%,#91e5ff_0,transparent_26%),linear-gradient(134deg,#14399f,#3c4cdf_60%,#683fe7)] px-5 pt-6 pb-7 text-white">
        <div className="absolute -right-24 -bottom-24 size-[180px] rounded-full border-[28px] border-white/10" />
        <Link href="/shop" className="relative mb-3 flex items-center gap-1 text-[11px] font-bold opacity-90">
          <ArrowLeft className="size-3.5" />
          All shops
        </Link>
        <div className="relative flex items-center justify-between">
          <div>
            <span className="block text-[11px] opacity-80">{shopName.toUpperCase()}</span>
            {shop.deliveryEstimate ? (
              <div className="mt-0.5 flex items-center gap-1 text-[15px] font-extrabold">
                <Clock className="size-3.5" />
                {shop.deliveryEstimate} delivery
              </div>
            ) : (
              <div className="mt-0.5 text-[15px] font-extrabold">Ordering made simple</div>
            )}
          </div>
          <div className="grid size-[38px] place-items-center rounded-2xl bg-gradient-to-br from-[#ffd897] to-[#ff9c74] text-lg shadow-[0_5px_17px_#14298966]">
            🧑
          </div>
        </div>
        <div className="relative mt-7 mb-4 text-[21px] font-extrabold">
          {timeGreeting}, {greetingName} 👋
        </div>
        <button
          onClick={onSearchFocus}
          className="relative flex h-14 w-full items-center gap-2.5 rounded-[18px] bg-white/97 px-3.5 text-left text-muted-foreground shadow-[0_10px_24px_#0c236a30]"
        >
          <Search className="size-4 shrink-0" />
          <span className="flex-1 text-sm">Search anything…</span>
          <span className="grid size-[31px] shrink-0 place-items-center rounded-[10px] bg-accent text-primary">
            <Mic className="size-4" />
          </span>
          <span className="grid size-[31px] shrink-0 place-items-center rounded-[10px] bg-accent text-primary">
            <ScanLine className="size-4" />
          </span>
        </button>
      </header>

      <main className="px-4">
        <div className="scrollbar-none -mx-4 mt-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-0.5">
          <button
            onClick={() => onCategorySelect(null)}
            className={`shrink-0 rounded-[13px] px-3.5 py-2 text-xs font-bold whitespace-nowrap ${
              activeCategoryId === null ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            For you
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategorySelect(c.id)}
              className={`shrink-0 rounded-[13px] px-3.5 py-2 text-xs font-bold whitespace-nowrap ${
                activeCategoryId === c.id ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        <div className="relative min-h-[150px] overflow-hidden rounded-[23px] bg-gradient-to-r from-[#ff6a31] to-[#fe9b32] p-5 text-white">
          <div className="absolute top-[-25px] right-[-20px] size-[135px] rounded-[47%_53%_60%_40%] bg-[#ffe078]" />
          <div className="absolute top-[26px] right-[19px] text-[74px] drop-shadow-[0_12px_7px_#ba491755]">🛍️</div>
          <div className="relative text-[10px] font-extrabold tracking-[1.3px] uppercase opacity-90">
            Fresh from {shopName}
          </div>
          <h1 className="relative mt-1.5 mb-1.5 max-w-[210px] text-2xl leading-tight font-extrabold">
            Everyday essentials, ready when you are.
          </h1>
          <p className="relative m-0 text-xs font-semibold">Real stock, updated live from the shop counter.</p>
          <button
            onClick={onSearchFocus}
            className="relative mt-3.5 rounded-[11px] bg-white px-3.5 py-2.5 text-[11px] font-extrabold text-[#df4b23]"
          >
            Ask Bharat AI →
          </button>
        </div>

        {categories.length > 0 && (
          <>
            <div className="mt-6 mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-foreground">Shop by category</h2>
            </div>
            <div className="scrollbar-none flex gap-2.5 overflow-x-auto pb-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategorySelect(c.id)}
                  className="min-w-[72px] shrink-0 text-center"
                >
                  <div className="grid h-[67px] place-items-center rounded-[20px] bg-gradient-to-br from-[#edf3ff] to-[#dae6ff] text-[28px]">
                    {c.icon}
                  </div>
                  <div className="mt-1.5 text-[10px] font-bold text-muted-foreground">{c.name}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {featured && (
          <>
            <div className="mt-6 mb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-foreground">✨ Editor&apos;s pick</h2>
              <button onClick={onOpenSearch} className="text-[11px] font-extrabold text-primary">
                Ask Bharat AI
              </button>
            </div>
            <div className="relative overflow-hidden rounded-[22px] border border-[#e6e2fb] bg-gradient-to-br from-[#eff3ff] to-[#f8edff] p-4">
              <span className="absolute top-2.5 right-4 text-4xl text-[#9368ff]">✦</span>
              <div className="text-[11px] font-extrabold text-[#7657ca]">BHARAT AI · IN STOCK NOW</div>
              <h3 className="my-1 text-[17px] font-extrabold text-foreground">{featured.name}</h3>
              <p className="m-0 max-w-[265px] text-[11px] leading-relaxed text-muted-foreground">
                {featured.quantity} {featured.unit} available{featured.categoryName ? ` · ${featured.categoryName}` : ""} — arrives from {shopName}&apos;s live stock.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => onAddToCart(featured)}
                  className="rounded-[11px] bg-[#5c42ce] px-3 py-2.5 text-[11px] font-extrabold text-white"
                >
                  Add · ₹{featured.price}
                </button>
                <button
                  onClick={onOpenSearch}
                  className="rounded-[11px] bg-white px-3 py-2.5 text-[11px] font-extrabold text-[#6148be]"
                >
                  Plan a basket
                </button>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 mb-3 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-foreground">
            {activeCategoryId ? "Filtered for you" : "Popular near you"}
          </h2>
          <span className="text-[11px] font-extrabold text-muted-foreground">{visibleProducts.length} items</span>
        </div>
        {visibleProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No in-stock products in this category right now.
          </p>
        ) : (
          <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {visibleProducts.map((p) => (
              <article
                key={p.id}
                className="relative min-w-[150px] rounded-[19px] border border-border bg-card p-2.5"
              >
                <button
                  aria-label="Save for later"
                  className="absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-[9px] bg-[#fff0f5] text-[#f34984]"
                >
                  <Heart className="size-3.5" />
                </button>
                <div className="grid h-[108px] place-items-center rounded-[13px] bg-muted text-[46px]">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="size-full rounded-[13px] object-cover" />
                  ) : (
                    p.categoryIcon
                  )}
                </div>
                {p.quantity <= 5 && (
                  <span className="mt-2 inline-block rounded-[6px] bg-[#e5f9f1] px-1.5 py-1 text-[9px] font-extrabold text-[#07845e]">
                    ONLY {p.quantity} LEFT
                  </span>
                )}
                <h3 className="mt-1.5 mb-1 line-clamp-2 text-xs leading-tight font-semibold text-foreground">
                  {p.name}
                </h3>
                <div className="text-[10px] text-muted-foreground">
                  {p.unit}
                  {p.categoryName ? ` · ${p.categoryName}` : ""}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-mono text-sm font-medium text-foreground">₹{p.price}</div>
                  <button
                    onClick={() => onAddToCart(p)}
                    className="rounded-[9px] bg-accent px-2.5 py-1.5 text-[11px] font-extrabold text-primary"
                  >
                    ADD
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
