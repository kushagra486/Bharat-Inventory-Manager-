"use client";

import { useMemo, useState } from "react";
import { Minus, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/mock-data";

type Product = { id: string; name: string; price: number | null; quantity: number; unit: string };
type CartLine = { id: string; qty: number };
type PaymentMethod = "UPI" | "Cash" | "Card";

const GST_RATE = 0.05;

export function PosView({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payment, setPayment] = useState<PaymentMethod>("UPI");
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const cartLines = cart
    .map((c) => {
      const product = byId.get(c.id);
      if (!product || product.price == null) return null;
      return { ...c, name: product.name, price: product.price, lineTotal: product.price * c.qty };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const subtotal = cartLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gst;

  function addToCart(product: Product) {
    if (product.price == null) {
      toast.error(`${product.name} has no price set yet.`);
      return;
    }
    setCart((prev) => {
      const found = prev.find((c) => c.id === product.id);
      if (found) {
        return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id: product.id, qty: 1 }];
    });
  }

  function incLine(id: string) {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)));
  }

  function decLine(id: string) {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c)).filter((c) => c.qty > 0));
  }

  function completeCheckout() {
    toast.success(`Payment confirmed via ${payment} — ₹${formatINR(grandTotal)}`);
    setCart([]);
    setCheckoutOpen(false);
  }

  const cartPanel = (
    <div className="flex flex-col gap-3">
      <div className="text-[10px] font-medium tracking-wider text-primary uppercase">Cart</div>
      {cartLines.length === 0 ? (
        <p className="py-4 text-sm text-muted-foreground">Tap products to add them here.</p>
      ) : (
        <div className="flex flex-col">
          {cartLines.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between border-b border-border py-2 last:border-0"
            >
              <div>
                <div className="text-sm">{line.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() => decLine(line.id)}
                    aria-label={`Decrease ${line.name}`}
                  >
                    <Minus className="size-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {line.qty} × ₹{formatINR(line.price)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() => incLine(line.id)}
                    aria-label={`Increase ${line.name}`}
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
              <div className="text-sm font-semibold">₹{formatINR(line.lineTotal)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>₹{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>GST (5%)</span>
          <span>₹{formatINR(gst)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Total</span>
          <span>₹{formatINR(grandTotal)}</span>
        </div>
      </div>

      <div className="inline-flex overflow-hidden rounded-md border border-border">
        {(["UPI", "Cash", "Card"] as PaymentMethod[]).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPayment(method)}
            className={cn(
              "flex-1 border-l border-border py-1.5 text-xs first:border-l-0",
              payment === method ? "text-primary shadow-[inset_0_0_0_1px_var(--primary)]" : "hover:bg-muted",
            )}
          >
            {method}
          </button>
        ))}
      </div>

      <Button disabled={cartLines.length === 0} onClick={completeCheckout}>
        Confirm payment · ₹{formatINR(grandTotal)}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-start">
      <div className="grid flex-1 grid-cols-2 gap-3 pb-24 sm:grid-cols-3 lg:grid-cols-4 lg:pb-0">
        {products.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            No products yet — add some in Inventory first.
          </p>
        )}
        {products.map((p) => (
          <Card
            key={p.id}
            className={cn(
              "cursor-pointer gap-2 py-3 text-center transition-colors hover:bg-muted/50",
              p.price == null && "opacity-60",
            )}
            onClick={() => addToCart(p)}
          >
            <CardContent className="flex flex-col items-center gap-1.5 px-3">
              <div className="flex h-12 w-full items-center justify-center rounded-md bg-muted text-muted-foreground">
                <Package className="size-5" />
              </div>
              <div className="line-clamp-2 text-xs leading-tight">{p.name}</div>
              <div className="text-sm font-semibold text-primary">
                {p.price != null ? `₹${formatINR(p.price)}` : "No price"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden py-4 lg:sticky lg:top-4 lg:block lg:w-80 lg:shrink-0">
        <CardContent className="px-4">{cartPanel}</CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+56px)] z-30 px-4 lg:hidden">
        <Card className="py-3 shadow-lg">
          <CardContent className="flex items-center justify-between gap-3 px-3">
            <div>
              <div className="text-[11px] text-muted-foreground">{cartCount} items in cart</div>
              <div className="text-base font-semibold">₹{formatINR(subtotal)}</div>
            </div>
            <Button disabled={cartLines.length === 0} onClick={() => setCheckoutOpen(true)}>
              Checkout
            </Button>
          </CardContent>
        </Card>
      </div>

      {checkoutOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/40 lg:hidden"
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-popover p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-base font-medium">Checkout</h3>
            {cartPanel}
          </div>
        </div>
      )}
    </div>
  );
}
