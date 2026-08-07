"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { placeOrder } from "@/app/shop/actions";
import { AuthOverlay } from "@/app/shop/_components/auth-overlay";
import { UpiPaymentOverlay, type PendingPayment } from "@/app/shop/_components/upi-payment-overlay";
import { BottomNav } from "@/app/shop/_components/bottom-nav";
import { MarketplaceScreen } from "@/app/shop/_components/marketplace-screen";
import { HomeScreen } from "@/app/shop/_components/home-screen";
import { SearchScreen } from "@/app/shop/_components/search-screen";
import { CartScreen } from "@/app/shop/_components/cart-screen";
import { OrdersScreen } from "@/app/shop/_components/orders-screen";
import { ProfileScreen } from "@/app/shop/_components/profile-screen";
import type {
  CartLine,
  CategoryVM,
  CustomerProfileVM,
  OrderVM,
  ProductVM,
  Screen,
  ShopVM,
} from "@/app/shop/_components/types";

const CART_STORAGE_KEY = "bharat-store-cart-v1";

type CustomerRow = {
  id: string;
  ownerId: string;
  name: string;
  phone: string | null;
  loyaltyPoints: number;
};

export function MarketplaceApp({
  shops,
  products,
  shopCategories = [],
  shopId,
}: {
  shops: ShopVM[];
  products: ProductVM[];
  shopCategories?: CategoryVM[];
  shopId: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerRows, setCustomerRows] = useState<CustomerRow[]>([]);
  const [orders, setOrders] = useState<OrderVM[] | null>(null);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[] | null>(null);

  const currentShop = shopId ? (shops.find((s) => s.id === shopId) ?? null) : null;
  const shopProducts = shopId ? products.filter((p) => p.ownerId === shopId) : [];
  const shopsById = useMemo(() => new Map(shops.map((s) => [s.id, s])), [shops]);

  // Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
      setShowAuthOverlay(!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) setShowAuthOverlay(false);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Cart persists across shop-to-shop navigation and reloads. The save
  // effect must not fire until the load effect has had a chance to run,
  // otherwise it clobbers a previous page's saved cart with this mount's
  // still-empty initial state.
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) setCart(JSON.parse(raw));
      } catch {
        // ignore malformed/unavailable storage
      } finally {
        setCartHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore quota/unavailable storage
    }
  }, [cart, cartHydrated]);

  // Return fresh data directly (rather than reading it back out of state)
  // so callers that need to chain a rows-fetch into an orders-fetch (e.g.
  // right after checkout) never race against React's batched state
  // updates and read a stale customerRows closure.
  const fetchCustomerRows = useCallback(async (): Promise<CustomerRow[]> => {
    if (!session) return [];
    const { data } = await supabase
      .from("customers")
      .select("id, user_id, name, phone, loyalty_points")
      .eq("auth_user_id", session.user.id)
      .order("created_at", { ascending: false });
    return (data ?? []).map((c) => ({
      id: c.id,
      ownerId: c.user_id,
      name: c.name,
      phone: c.phone,
      loyaltyPoints: c.loyalty_points,
    }));
  }, [session, supabase]);

  const fetchOrders = useCallback(
    async (rows: CustomerRow[]): Promise<OrderVM[] | null> => {
      if (!session) return null;
      if (rows.length === 0) return [];
      const { data } = await supabase
        .from("sales_orders")
        .select(
          "id, order_number, status, total, created_at, user_id, sales_order_items(product_name, quantity, unit_price, line_total)",
        )
        .in(
          "customer_id",
          rows.map((c) => c.id),
        )
        .order("created_at", { ascending: false });
      return (data ?? []).map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        total: Number(o.total),
        createdAt: o.created_at,
        shopName: shopsById.get(o.user_id)?.name ?? "Shop",
        items: (o.sales_order_items ?? []).map((i) => ({
          productName: i.product_name,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          lineTotal: Number(i.line_total),
        })),
      }));
    },
    [session, supabase, shopsById],
  );

  const refreshCustomerRows = useCallback(async () => {
    const rows = await fetchCustomerRows();
    setCustomerRows(rows);
    return rows;
  }, [fetchCustomerRows]);

  const refreshOrders = useCallback(async () => {
    const rows = await fetchCustomerRows();
    setCustomerRows(rows);
    setOrders(await fetchOrders(rows));
  }, [fetchCustomerRows, fetchOrders]);

  useEffect(() => {
    Promise.resolve().then(() => refreshCustomerRows());
  }, [refreshCustomerRows]);

  useEffect(() => {
    if (screen === "orders" || screen === "profile") {
      Promise.resolve().then(() => refreshOrders());
    }
  }, [screen, refreshOrders]);

  // Live order-status sync: RLS already scopes this to only the signed-in
  // customer's own orders across every shop, so no explicit filter needed.
  useEffect(() => {
    if (!session || customerRows.length === 0) return;
    const channel = supabase
      .channel(`customer-orders-${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "sales_orders" },
        (payload) => {
          const order = payload.new as { order_number: string; status: string };
          toast.success(`Order ${order.order_number} is now ${order.status}`);
          refreshOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, customerRows.length, supabase, refreshOrders]);

  function addToCart(product: ProductVM) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      const currentQty = existing?.quantity ?? 0;
      if (currentQty + 1 > product.quantity) {
        toast.error(`Only ${product.quantity} ${product.unit} of ${product.name} in stock`);
        return prev;
      }
      toast.success(`${product.name} added — ${product.shopName}`);
      if (existing) {
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          unit: product.unit,
          categoryIcon: product.categoryIcon,
          ownerId: product.ownerId,
          shopName: product.shopName,
          deliveryEstimate: product.deliveryEstimate,
        },
      ];
    });
  }

  function addManyToCart(items: ProductVM[]) {
    items.forEach((p) => addToCart(p));
  }

  function changeQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    );
  }

  async function handleCheckout(name: string, phone: string, paymentMethod: string) {
    const groups = new Map<string, CartLine[]>();
    for (const line of cart) {
      groups.set(line.ownerId, [...(groups.get(line.ownerId) ?? []), line]);
    }
    const groupEntries = [...groups.entries()];

    const results = await Promise.allSettled(
      groupEntries.map(([ownerId, lines]) => placeOrder(ownerId, lines, name, phone, paymentMethod)),
    );

    const succeededOwnerIds = new Set<string>();
    const upiPayments: PendingPayment[] = [];
    let anySucceeded = false;
    results.forEach((result, i) => {
      const [ownerId] = groupEntries[i];
      const shop = shopsById.get(ownerId);
      const shopName = shop?.name ?? "the shop";
      if (result.status === "fulfilled") {
        anySucceeded = true;
        succeededOwnerIds.add(ownerId);
        toast.success(`${shopName}: order ${result.value.orderNumber} placed — ₹${result.value.total.toFixed(2)}`);
        if (paymentMethod === "upi" && shop?.upiId) {
          upiPayments.push({
            orderNumber: result.value.orderNumber,
            shopName,
            upiId: shop.upiId,
            amount: result.value.total,
          });
        }
      } else {
        toast.error(`${shopName}: ${result.reason instanceof Error ? result.reason.message : "Checkout failed"}`);
      }
    });

    if (succeededOwnerIds.size > 0) {
      setCart((prev) => prev.filter((l) => !succeededOwnerIds.has(l.ownerId)));
    }
    if (anySucceeded) {
      if (upiPayments.length > 0) {
        setPendingPayments(upiPayments);
      } else {
        setScreen("orders");
      }
      await refreshOrders();
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setCustomerRows([]);
    setOrders(null);
    setScreen("home");
    toast.success("Signed out");
  }

  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);
  const totalLoyaltyPoints = customerRows.reduce((s, c) => s + c.loyaltyPoints, 0);

  const primaryProfile: CustomerProfileVM | null = useMemo(() => {
    if (customerRows.length === 0) return null;
    const forCurrentShop = shopId ? customerRows.find((c) => c.ownerId === shopId) : null;
    const row = forCurrentShop ?? customerRows[0];
    return { id: row.id, name: row.name, phone: row.phone, loyaltyPoints: row.loyaltyPoints };
  }, [customerRows, shopId]);

  const appName = currentShop?.name ?? "Bharat Store";

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-card pb-24">
      {authChecked && !session && showAuthOverlay && (
        <AuthOverlay shopName={appName} onAuthed={() => setShowAuthOverlay(false)} />
      )}
      {pendingPayments && (
        <UpiPaymentOverlay
          payments={pendingPayments}
          onClose={() => {
            setPendingPayments(null);
            setScreen("orders");
          }}
        />
      )}

      {screen === "home" &&
        (currentShop ? (
          <HomeScreen
            shop={currentShop}
            customerName={primaryProfile?.name ?? null}
            products={shopProducts}
            categories={shopCategories}
            activeCategoryId={activeCategoryId}
            onCategorySelect={setActiveCategoryId}
            onSearchFocus={() => setScreen("search")}
            onOpenSearch={() => setScreen("search")}
            onAddToCart={addToCart}
          />
        ) : (
          <MarketplaceScreen
            customerName={primaryProfile?.name ?? null}
            shops={shops}
            onSearchFocus={() => setScreen("search")}
          />
        ))}
      {screen === "search" && <SearchScreen products={products} onAddProducts={addManyToCart} />}
      {screen === "cart" && (
        <CartScreen
          cart={cart}
          onChangeQty={changeQty}
          isAuthenticated={!!session}
          customerProfile={primaryProfile}
          onRequireAuth={() => setShowAuthOverlay(true)}
          onGoSearch={() => setScreen("search")}
          onCheckout={handleCheckout}
        />
      )}
      {screen === "orders" && (
        <OrdersScreen
          isAuthenticated={!!session}
          orders={orders}
          onRequireAuth={() => setShowAuthOverlay(true)}
        />
      )}
      {screen === "profile" && (
        <ProfileScreen
          isAuthenticated={!!session}
          email={session?.user.email ?? null}
          customerProfile={primaryProfile}
          totalLoyaltyPoints={totalLoyaltyPoints}
          orders={orders}
          onSignOut={handleSignOut}
          onRequireAuth={() => setShowAuthOverlay(true)}
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[430px]">
        <button
          onClick={() => setScreen("search")}
          aria-label="Open Bharat AI"
          className="pointer-events-auto absolute right-5 bottom-[90px] grid size-[55px] place-items-center rounded-[20px] bg-gradient-to-br from-[#623de6] to-[#3169f3] text-white shadow-[0_9px_22px_#4a4cd37a]"
        >
          <Sparkles className="size-6" />
        </button>
        <div className="pointer-events-auto">
          <BottomNav screen={screen} onNavigate={setScreen} cartCount={cartCount} />
        </div>
      </div>
    </div>
  );
}
