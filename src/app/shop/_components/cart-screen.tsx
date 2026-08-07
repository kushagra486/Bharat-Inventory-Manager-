"use client";

import { useMemo, useState, useTransition } from "react";
import { Minus, Plus, ShoppingCart, Clock, Store } from "lucide-react";
import { toast } from "sonner";
import type { CartLine, CustomerProfileVM } from "@/app/shop/_components/types";

const GST_RATE = 0.05;
const PAYMENT_METHODS = ["cod", "upi", "card"] as const;

export function CartScreen({
  cart,
  onChangeQty,
  isAuthenticated,
  customerProfile,
  onRequireAuth,
  onGoSearch,
  onCheckout,
}: {
  cart: CartLine[];
  onChangeQty: (productId: string, delta: number) => void;
  isAuthenticated: boolean;
  customerProfile: CustomerProfileVM | null;
  onRequireAuth: () => void;
  onGoSearch: () => void;
  onCheckout: (name: string, phone: string, paymentMethod: string) => Promise<void>;
}) {
  const [name, setName] = useState(customerProfile?.name ?? "");
  const [phone, setPhone] = useState(customerProfile?.phone ?? "");
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("cod");
  const [isPending, startTransition] = useTransition();

  const groups = useMemo(() => {
    const byShop = new Map<string, { shopName: string; deliveryEstimate: string | null; lines: CartLine[] }>();
    for (const line of cart) {
      const g = byShop.get(line.ownerId) ?? {
        shopName: line.shopName,
        deliveryEstimate: line.deliveryEstimate,
        lines: [],
      };
      g.lines.push(line);
      byShop.set(line.ownerId, g);
    }
    return [...byShop.entries()].map(([ownerId, g]) => {
      const subtotal = g.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
      const tax = Math.round(subtotal * GST_RATE * 100) / 100;
      return { ownerId, ...g, subtotal, tax, total: subtotal + tax };
    });
  }, [cart]);

  const grandTotal = groups.reduce((sum, g) => sum + g.total, 0);

  function handleCheckout() {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    if (!name.trim()) {
      toast.error("Enter your name to place the order.");
      return;
    }
    startTransition(async () => {
      await onCheckout(name, phone, paymentMethod);
    });
  }

  if (cart.length === 0) {
    return (
      <div className="px-4 py-5">
        <h1 className="mb-4 text-2xl font-extrabold text-foreground">Your cart</h1>
        <div className="mt-16 text-center text-muted-foreground">
          <ShoppingCart className="mx-auto mb-3 size-12 text-muted-foreground/60" />
          <h2 className="mb-1.5 text-lg font-bold text-foreground">Your cart is waiting</h2>
          <p className="mx-auto max-w-[240px] text-xs leading-relaxed">
            Add everyday essentials or let Bharat AI make a basket for you.
          </p>
          <button
            onClick={onGoSearch}
            className="mt-4 rounded-[11px] bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground"
          >
            Ask Bharat AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <h1 className="mb-1 text-2xl font-extrabold text-foreground">Your cart</h1>
      {groups.length > 1 && (
        <p className="mb-4 text-xs text-muted-foreground">
          Items from {groups.length} shops — each is placed as a separate order.
        </p>
      )}

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.ownerId} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
                <Store className="size-3.5 text-primary" />
                {group.shopName}
              </div>
              {group.deliveryEstimate && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                  <Clock className="size-3" />
                  {group.deliveryEstimate}
                </div>
              )}
            </div>

            <ul className="flex flex-col gap-2.5">
              {group.lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-muted text-xl">
                      {line.categoryIcon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{line.name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        ₹{line.price} · {line.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onChangeQty(line.productId, -1)}
                      className="grid size-7 place-items-center rounded-full bg-muted text-foreground"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-4 text-center text-xs font-bold">{line.quantity}</span>
                    <button
                      onClick={() => onChangeQty(line.productId, 1)}
                      className="grid size-7 place-items-center rounded-full bg-accent text-primary"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-3.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">₹{group.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (5%)</span>
                <span className="font-mono">₹{group.tax.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-border pt-1.5 text-sm font-extrabold text-foreground">
                <span>{group.shopName} total</span>
                <span className="font-mono">₹{group.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between rounded-2xl bg-accent p-3.5 text-base font-extrabold text-primary">
        <span>Grand total</span>
        <span className="font-mono">₹{grandTotal.toFixed(2)}</span>
      </div>

      {isAuthenticated && (
        <div className="mt-4 grid gap-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground outline-none focus:border-primary"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            inputMode="numeric"
            className="w-full rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 rounded-[11px] py-2 text-[11px] font-extrabold uppercase ${
                  paymentMethod === method ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={isPending}
        className="mt-4 w-full rounded-[13px] bg-gradient-to-r from-[#365cf3] to-[#663ee4] py-3.5 text-[13px] font-extrabold text-white disabled:opacity-60"
      >
        {isPending
          ? "Placing order…"
          : isAuthenticated
            ? `Checkout · ${groups.length > 1 ? `${groups.length} orders · ` : ""}₹${grandTotal.toFixed(2)}`
            : "Sign in to checkout"}
      </button>
    </div>
  );
}
