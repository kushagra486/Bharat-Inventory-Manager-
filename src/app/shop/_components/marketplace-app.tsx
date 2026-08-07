"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { placeOrder } from "@/app/shop/[ownerId]/actions";
import { AuthOverlay } from "@/app/shop/[ownerId]/_components/auth-overlay";
import { BottomNav } from "@/app/shop/[ownerId]/_components/bottom-nav";
import { HomeScreen } from "@/app/shop/[ownerId]/_components/home-screen";
import { SearchScreen } from "@/app/shop/[ownerId]/_components/search-screen";
import { CartScreen } from "@/app/shop/[ownerId]/_components/cart-screen";
import { OrdersScreen } from "@/app/shop/[ownerId]/_components/orders-screen";
import { ProfileScreen } from "@/app/shop/[ownerId]/_components/profile-screen";
import type {
  CartLine,
  CategoryVM,
  CustomerProfileVM,
  OrderVM,
  ProductVM,
  Screen,
} from "@/app/shop/[ownerId]/_components/types";

export function StorefrontApp({
  ownerId,
  shopName,
  categories,
  products,
}: {
  ownerId: string;
  shopName: string;
  categories: CategoryVM[];
  products: ProductVM[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfileVM | null>(null);
  const [orders, setOrders] = useState<OrderVM[] | null>(null);

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

  const loadCustomerProfile = useCallback(async () => {
    if (!session) {
      setCustomerProfile(null);
      return;
    }
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone, loyalty_points")
      .eq("auth_user_id", session.user.id)
      .eq("user_id", ownerId)
      .maybeSingle();
    setCustomerProfile(
      data
        ? { id: data.id, name: data.name, phone: data.phone, loyaltyPoints: data.loyalty_points }
        : null,
    );
  }, [session, ownerId, supabase]);

  useEffect(() => {
    // Deferred through a microtask so the linked-list of setState calls
    // inside loadCustomerProfile isn't invoked synchronously from the
    // effect body (see react-hooks/set-state-in-effect).
    Promise.resolve().then(() => loadCustomerProfile());
  }, [loadCustomerProfile]);

  const loadOrders = useCallback(async () => {
    if (!session) {
      setOrders(null);
      return;
    }
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("auth_user_id", session.user.id)
      .eq("user_id", ownerId)
      .maybeSingle();
    if (!customer) {
      setOrders([]);
      return;
    }
    const { data } = await supabase
      .from("sales_orders")
      .select(
        "id, order_number, status, total, created_at, sales_order_items(product_name, quantity, unit_price, line_total)",
      )
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });
    setOrders(
      (data ?? []).map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        status: o.status,
        total: Number(o.total),
        createdAt: o.created_at,
        items: (o.sales_order_items ?? []).map((i) => ({
          productName: i.product_name,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          lineTotal: Number(i.line_total),
        })),
      })),
    );
  }, [session, ownerId, supabase]);

  useEffect(() => {
    if (screen === "orders" || screen === "profile") {
      Promise.resolve().then(() => loadOrders());
    }
  }, [screen, loadOrders]);

  useEffect(() => {
    if (!customerProfile) return;
    const channel = supabase
      .channel(`customer-orders-${customerProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sales_orders",
          filter: `customer_id=eq.${customerProfile.id}`,
        },
        (payload) => {
          const order = payload.new as { order_number: string; status: string };
          toast.success(`Order ${order.order_number} is now ${order.status}`);
          loadOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerProfile, supabase, loadOrders]);

  function addToCart(product: ProductVM) {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      const currentQty = existing?.quantity ?? 0;
      if (currentQty + 1 > product.quantity) {
        toast.error(`Only ${product.quantity} ${product.unit} of ${product.name} in stock`);
        return prev;
      }
      toast.success(`${product.name} added to your cart`);
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
    try {
      const result = await placeOrder(ownerId, cart, name, phone, paymentMethod);
      toast.success(`Order ${result.orderNumber} placed — ₹${result.total.toFixed(2)}`);
      setCart([]);
      setScreen("orders");
      await Promise.all([loadCustomerProfile(), loadOrders()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setCustomerProfile(null);
    setOrders(null);
    setScreen("home");
    toast.success("Signed out");
  }

  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-card pb-24">
      {authChecked && !session && showAuthOverlay && (
        <AuthOverlay shopName={shopName} onAuthed={() => setShowAuthOverlay(false)} />
      )}

      {screen === "home" && (
        <HomeScreen
          shopName={shopName}
          customerName={customerProfile?.name ?? null}
          products={products}
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={setActiveCategoryId}
          onSearchFocus={() => setScreen("search")}
          onOpenSearch={() => setScreen("search")}
          onAddToCart={addToCart}
        />
      )}
      {screen === "search" && (
        <SearchScreen ownerId={ownerId} products={products} onAddProducts={addManyToCart} />
      )}
      {screen === "cart" && (
        <CartScreen
          cart={cart}
          onChangeQty={changeQty}
          isAuthenticated={!!session}
          customerProfile={customerProfile}
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
          customerProfile={customerProfile}
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
