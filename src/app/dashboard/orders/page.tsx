import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/app/dashboard/orders/orders-table";

export default async function OrdersPage() {
  const supabase = await createClient();

  const [ordersRes, itemsRes] = await Promise.all([
    supabase
      .from("sales_orders")
      .select("*, customers(name, phone, auth_user_id)")
      .order("created_at", { ascending: false }),
    supabase.from("sales_order_items").select("order_id"),
  ]);

  const itemCounts = new Map<string, number>();
  for (const item of itemsRes.data ?? []) {
    itemCounts.set(item.order_id, (itemCounts.get(item.order_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Every sale — rung up in-store on the POS or placed by customers on your storefront.
        </p>
      </div>
      <OrdersTable orders={ordersRes.data ?? []} itemCounts={Object.fromEntries(itemCounts)} />
    </div>
  );
}
