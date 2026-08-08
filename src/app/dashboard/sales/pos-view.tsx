"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ScanLine, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarcodeScannerDialog } from "@/components/barcode-scanner-dialog";
import { checkout, type CartLine } from "@/app/dashboard/sales/actions";

type Product = {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
  unit: string;
  barcode: string | null;
  categories: { name: string } | null;
};
type Customer = { id: string; name: string };

const GST_RATE = 0.05;
const PAYMENT_METHODS = ["cash", "upi", "card"] as const;

export function PosView({ products, customers }: { products: Product[]; customers: Customer[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("cash");
  const [isPending, startTransition] = useTransition();
  const [scannerOpen, setScannerOpen] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [cart],
  );
  const tax = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + tax;

  function addToCart(product: Product) {
    if (product.price == null) {
      toast.error(`${product.name} has no price set`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      const stockAvailable = product.quantity;
      const currentQty = existing?.quantity ?? 0;
      if (currentQty + 1 > stockAvailable) {
        toast.error(`Only ${stockAvailable} ${product.unit} of ${product.name} in stock`);
        return prev;
      }
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price!, quantity: 1 }];
    });
  }

  function handleScan(code: string) {
    const product = products.find((p) => p.barcode === code);
    if (!product) {
      toast.error(`No product matches barcode ${code}`);
      return;
    }
    addToCart(product);
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  function handleCheckout() {
    startTransition(async () => {
      try {
        const result = await checkout(cart, customerId, paymentMethod);
        toast.success(`Order ${result.orderNumber} completed — ₹${result.total.toFixed(2)}`);
        setCart([]);
        setCustomerId(null);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Checkout failed");
      }
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setScannerOpen(true)}>
          <ScanLine />
          Scan barcode
        </Button>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">
              No in-stock products available. Add stock in Products first.
            </p>
          )}
          {products.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer items-center gap-2 py-4 text-center transition-colors hover:bg-accent/50"
              onClick={() => addToCart(product)}
            >
              <CardContent className="flex flex-col items-center gap-1">
                <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <ShoppingCart className="size-5" />
                </div>
                <p className="text-sm">{product.name}</p>
                <p className="text-sm font-medium text-primary">
                  {product.price != null ? `₹${product.price}` : "—"}
                </p>
                <Badge variant="secondary" className="text-[10px]">
                  {product.quantity} {product.unit} left
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="lg:sticky lg:top-4">
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-wide text-primary uppercase">Cart</p>

          {cart.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tap products to add them here.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {cart.map((line) => (
                <li key={line.productId} className="flex items-center justify-between border-b pb-2 text-sm">
                  <div>
                    <p>{line.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="icon-xs"
                        onClick={() => changeQty(line.productId, -1)}
                      >
                        <Minus />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {line.quantity} × ₹{line.price}
                      </span>
                      <Button
                        variant="secondary"
                        size="icon-xs"
                        onClick={() => changeQty(line.productId, 1)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                  <span className="font-medium">₹{(line.price * line.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Select
              value={customerId ?? undefined}
              onValueChange={(v) => setCustomerId(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Walk-in customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {PAYMENT_METHODS.map((method) => (
                <Badge
                  key={method}
                  variant={paymentMethod === method ? "default" : "outline"}
                  className="flex-1 cursor-pointer justify-center py-1.5 uppercase"
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </Badge>
              ))}
            </div>
          </div>

          <Button disabled={cart.length === 0 || isPending} onClick={handleCheckout}>
            {isPending ? "Processing..." : `Checkout · ₹${total.toFixed(2)}`}
          </Button>
        </CardContent>
      </Card>

      <BarcodeScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onDetected={handleScan} />
    </div>
  );
}
